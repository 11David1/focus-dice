export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const scheduleGoalCheck = async (goalText: string) => {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  const now = new Date();
  const targetTime = new Date();
  
  // Standardzeit: 18:00 Uhr
  targetTime.setHours(18, 0, 0, 0);

  // Wenn es schon nach 17:00 Uhr ist (oder kurz davor), setze den Timer auf +2 Stunden ab jetzt
  if (now.getHours() >= 17) {
    targetTime.setTime(now.getTime() + (2 * 60 * 60 * 1000));
  } else if (now > targetTime) {
    // Falls es z.B. 17:30 ist (durch obige Logik abgefangen), aber sicherheitshalber:
    targetTime.setTime(now.getTime() + (1 * 60 * 60 * 1000));
  }

  const delay = targetTime.getTime() - now.getTime();

  if (delay <= 0) return;

  console.log(`Notification scheduled in ${Math.round(delay / 60000)} minutes for goal: "${goalText}"`);

  setTimeout(() => {
    if (Notification.permission === 'granted') {
      try {
        new Notification("Focus Dice: Tagesziel Check 🎯", {
          body: `Hast du dein Ziel erreicht?\n"${goalText}"`,
          tag: 'focus-dice-goal-check', // Prevent duplicate notifications
          requireInteraction: true // Keeps it visible on some OS until user interacts
        });
      } catch (e) {
        console.error("Notification failed", e);
      }
    }
  }, delay);
};