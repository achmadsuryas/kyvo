const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;

if (!DISCORD_BOT_TOKEN || !DISCORD_CLIENT_ID) {
  console.error("❌ Error: DISCORD_BOT_TOKEN and DISCORD_CLIENT_ID must be set in process.env.");
  process.exit(1);
}

const COMMANDS = [
  {
    name: "reply",
    description: "[Admin Only] Reply to a support ticket from Discord (Syncs live to website)",
    default_member_permissions: "8", // Administrator Only
    options: [
      {
        name: "message",
        description: "Your reply message to the user",
        type: 3, // STRING
        required: true,
      },
    ],
  },
  {
    name: "status",
    description: "[Admin Only] Update ticket status (in_progress or resolved)",
    default_member_permissions: "8", // Administrator Only
    options: [
      {
        name: "status",
        description: "Select ticket status",
        type: 3, // STRING
        required: true,
        choices: [
          { name: "In Progress ⏳", value: "in_progress" },
          { name: "Resolved & Closed ✅", value: "resolved" },
          { name: "Open 🎫", value: "open" },
        ],
      },
    ],
  },
  {
    name: "check-user",
    description: "[Admin Only] Check user profile, status, views, and badges on Kyvo",
    default_member_permissions: "8", // Administrator Only
    options: [
      {
        name: "username",
        description: "Kyvo username (without @)",
        type: 3, // STRING
        required: true,
      },
    ],
  },
  {
    name: "tickets",
    description: "[Admin Only] List all active open & in-progress support tickets",
    default_member_permissions: "8", // Administrator Only
  },
  {
    name: "stats",
    description: "View Kyvo platform global stats",
  },
];

async function registerCommands() {
  console.log("Registering Discord Admin Restricted Slash Commands...");
  const res = await fetch(`https://discord.com/api/v10/applications/${DISCORD_CLIENT_ID}/commands`, {
    method: "PUT",
    headers: {
      "Authorization": `Bot ${DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(COMMANDS),
  });

  if (res.ok) {
    const data = await res.json();
    console.log("✅ Successfully registered Admin-Restricted Slash Commands:", data.map(c => "/" + c.name).join(", "));
  } else {
    const err = await res.text();
    console.error("❌ Failed to register commands:", res.status, err);
  }
}

registerCommands().catch(console.error);
