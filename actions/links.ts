'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { LinkItem } from '@/types';

export async function getUserLinks(): Promise<LinkItem[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: links } = await supabase
      .from('links')
      .select('*')
      .eq('profile_id', user.id)
      .order('sort_order', { ascending: true });

    return (links as LinkItem[] | null) || [];
  } catch (err) {
    console.error('Error fetching user links:', err);
    return [];
  }
}

export async function createLink(formData: { title: string; url: string; icon: string; bg_color?: string }): Promise<{ success: boolean; message: string; link?: LinkItem }> {
  const { title, url, icon, bg_color } = formData;

  if (!title.trim()) {
    return { success: false, message: 'Link title is required.' };
  }

  let formattedUrl = url.trim();
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = `https://${formattedUrl}`;
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'You must be logged in.' };
    }

    // Get current link count for sort order
    const { count } = await supabase
      .from('links')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', user.id);

    const sort_order = (count || 0) + 1;

    const { data, error } = await (supabase.from('links') as any)
      .insert({
        profile_id: user.id,
        title: title.trim(),
        url: formattedUrl,
        icon: icon || 'Globe',
        bg_color: bg_color || '#FFD43B',
        sort_order,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/[username]');
    return { success: true, message: 'Link created successfully!', link: data as LinkItem };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create link.';
    return { success: false, message: msg };
  }
}

export async function updateLink(id: string, formData: { title: string; url: string; icon: string; is_active: boolean; bg_color?: string }): Promise<{ success: boolean; message: string }> {
  const { title, url, icon, is_active, bg_color } = formData;

  if (!title.trim()) {
    return { success: false, message: 'Link title is required.' };
  }

  let formattedUrl = url.trim();
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = `https://${formattedUrl}`;
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'You must be logged in.' };
    }

    const { error } = await (supabase.from('links') as any)
      .update({
        title: title.trim(),
        url: formattedUrl,
        icon: icon || 'Globe',
        bg_color: bg_color || '#FFD43B',
        is_active,
      })
      .eq('id', id)
      .eq('profile_id', user.id);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/[username]');
    return { success: true, message: 'Link updated successfully!' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update link.';
    return { success: false, message: msg };
  }
}

export async function deleteLink(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'You must be logged in.' };
    }

    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', id)
      .eq('profile_id', user.id);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/[username]');
    return { success: true, message: 'Link deleted successfully!' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete link.';
    return { success: false, message: msg };
  }
}

export async function toggleLinkActive(id: string, currentStatus: boolean): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'You must be logged in.' };
    }

    const { error } = await (supabase.from('links') as any)
      .update({ is_active: !currentStatus })
      .eq('id', id)
      .eq('profile_id', user.id);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/[username]');
    return { success: true, message: `Link ${!currentStatus ? 'activated' : 'hidden'}!` };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to toggle link status.';
    return { success: false, message: msg };
  }
}

export async function reorderLinks(orderedLinkIds: string[]): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'You must be logged in.' };
    }

    // Update each link's sort_order based on its position in orderedLinkIds array
    const updates = orderedLinkIds.map((id, index) =>
      (supabase.from('links') as any)
        .update({ sort_order: index + 1 })
        .eq('id', id)
        .eq('profile_id', user.id)
    );

    const results = await Promise.all(updates);
    const hasError = results.some((r) => r.error);

    if (hasError) {
      return { success: false, message: 'Failed to update link positions.' };
    }

    revalidatePath('/dashboard');
    revalidatePath('/[username]');
    return { success: true, message: 'Link order saved!' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to reorder links.';
    return { success: false, message: msg };
  }
}
