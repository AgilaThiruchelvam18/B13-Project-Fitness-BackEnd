const cron = require("node-cron");
const sendClassReminders = require("./reminderService");

// Run the reminder function every day at midnight (00:00)
cron.schedule("0 0 * * *", () => {
  console.log("🔔 Sending class reminders...");
  sendClassReminders();
});

module.exports = cron;
