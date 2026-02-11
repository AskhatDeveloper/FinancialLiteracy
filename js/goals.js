let goal = JSON.parse(localStorage.getItem("goal")) || null;

function setGoal(title, amount) {
  goal = {
    title,
    amount: Number(amount),
  };

  localStorage.setItem("goal", JSON.stringify(goal));
}

function getGoal() {
  return goal;
}

function clearGoal() {
  goal = null;
  localStorage.removeItem("goal");
}

export { setGoal, getGoal, clearGoal };
