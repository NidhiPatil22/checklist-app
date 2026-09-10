import { useEffect, useMemo, useState } from "react";
import "./App.css";

const STORAGE_KEY = "cute-daily-planner-v1";

const MOODS = [
  { value: "amazing", icon: "😄", label: "Amazing" },
  { value: "good", icon: "🙂", label: "Good" },
  { value: "okay", icon: "😐", label: "Okay" },
  { value: "low", icon: "🙁", label: "Low" },
  { value: "bad", icon: "😔", label: "Bad" },
];

/* =====================================================
   DATE HELPERS
===================================================== */

function getToday() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function dateToObject(dateString) {
  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  return new Date(year, month - 1, day);
}

function formatDate(dateString) {
  return dateToObject(dateString).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );
}

function formatMonth(dateString) {
  return dateToObject(dateString).toLocaleDateString(
    "en-US",
    {
      month: "short",
      year: "numeric",
    }
  );
}

function formatShortDate(dateString) {
  const date = dateToObject(dateString);

  return {
    day: date.toLocaleDateString("en-US", {
      weekday: "short",
    }),

    date: date.getDate(),

    month: date.toLocaleDateString("en-US", {
      month: "short",
    }),
  };
}

function changeDate(dateString, amount) {
  const date = dateToObject(dateString);

  date.setDate(date.getDate() + amount);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


/* =====================================================
   DEFAULT DAY
===================================================== */

function createEmptyDay() {
  return {
    tasks: [],

    mood: "",

    sleep: {
      hours: "",
      rested: 0,
    },

    water: 0,

    exercise: {
      workout: "",
      minutes: "",
      steps: "",
    },

    gratitude: "",

    notes: "",

    tomorrow: "",

    money: {
      in: "",
      inFrom: "",
      out: "",
      outFrom: "",
    },

    meals: {
      breakfast: "",
      lunch: "",
      dinner: "",
      snacks: "",
    },
  };
}


/* =====================================================
   MAIN APP
===================================================== */

export default function App() {

  const today = getToday();

  const [data, setData] = useState(() => {

    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const savedData = JSON.parse(saved);

        return {
          ...savedData,
          [today]: savedData[today] || createEmptyDay(),
        };
      }
    } catch (error) {
      console.error("Could not load planner data", error);
    }

    return {
      [today]: createEmptyDay(),
    };
  });


  const [selectedDate, setSelectedDate] =
    useState(today);

  const [activeTab, setActiveTab] =
    useState("today");

  const [newTask, setNewTask] =
    useState("");

  const [newPriority, setNewPriority] =
    useState("medium");


  /* =====================================================
     SAVE DATA
  ===================================================== */

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );
  }, [data]);


  /* =====================================================
     CURRENT DAY
  ===================================================== */

  const currentDay =
    data[selectedDate] || createEmptyDay();


  /* =====================================================
     DATES
  ===================================================== */

  const allDates = useMemo(() => {

    return Object.keys(data).sort(
      (a, b) =>
        dateToObject(b) - dateToObject(a)
    );

  }, [data]);


  const previousDates =
    allDates.filter(
      (date) => date !== today
    );


  /* =====================================================
     TASK STATS
  ===================================================== */

  const totalTasks =
    currentDay.tasks.length;

  const completedTasks =
    currentDay.tasks.filter(
      (task) => task.completed
    ).length;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks / totalTasks) * 100
        );


  /* =====================================================
     UPDATE DAY
  ===================================================== */

  function updateDay(updates) {

    setData((previous) => ({

      ...previous,

      [selectedDate]: {

        ...(previous[selectedDate] ||
          createEmptyDay()),

        ...updates,
      },

    }));
  }


  /* =====================================================
     ADD TASK
  ===================================================== */

  function addTask(event) {

    event.preventDefault();

    if (!newTask.trim()) {
      return;
    }

    const task = {

      id:
        Date.now() +
        Math.random(),

      text:
        newTask.trim(),

      priority:
        newPriority,

      completed:
        false,

    };


    updateDay({

      tasks: [
        ...currentDay.tasks,
        task,
      ],

    });


    setNewTask("");

    setNewPriority("medium");
  }


  /* =====================================================
     TOGGLE TASK
  ===================================================== */

  function toggleTask(taskId) {

    updateDay({

      tasks:
        currentDay.tasks.map(
          (task) =>
            task.id === taskId
              ? {
                  ...task,
                  completed:
                    !task.completed,
                }
              : task
        ),

    });
  }


  /* =====================================================
     DELETE TASK
  ===================================================== */

  function deleteTask(taskId) {

    updateDay({

      tasks:
        currentDay.tasks.filter(
          (task) =>
            task.id !== taskId
        ),

    });
  }


  /* =====================================================
     CHANGE PRIORITY
  ===================================================== */

  function changePriority(
    taskId,
    priority
  ) {

    updateDay({

      tasks:
        currentDay.tasks.map(
          (task) =>
            task.id === taskId
              ? {
                  ...task,
                  priority,
                }
              : task
        ),

    });
  }


  /* =====================================================
     DATE NAVIGATION
  ===================================================== */

  function goToDate(date) {

    setSelectedDate(date);

    setActiveTab("today");

    if (!data[date]) {

      setData((previous) => ({

        ...previous,

        [date]:
          createEmptyDay(),

      }));
    }
  }


  function goPreviousDay() {

    goToDate(
      changeDate(
        selectedDate,
        -1
      )
    );
  }


  function goNextDay() {

    const nextDate =
      changeDate(
        selectedDate,
        1
      );

    /*
      Don't allow navigating into
      dates beyond today.
    */

    if (
      dateToObject(nextDate) >
      dateToObject(today)
    ) {
      return;
    }

    goToDate(nextDate);
  }


  /* =====================================================
     UPDATE NESTED DATA
  ===================================================== */

  function updateSleep(field, value) {

    updateDay({

      sleep: {

        ...currentDay.sleep,

        [field]: value,

      },

    });
  }


  function updateExercise(
    field,
    value
  ) {

    updateDay({

      exercise: {

        ...currentDay.exercise,

        [field]: value,

      },

    });
  }


  function updateMoney(
    field,
    value
  ) {

    updateDay({

      money: {

        ...currentDay.money,

        [field]: value,

      },

    });
  }


  function updateMeals(
    field,
    value
  ) {

    updateDay({

      meals: {

        ...currentDay.meals,

        [field]: value,

      },

    });
  }


  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <div className="app">

      <div className="floating-flower flower-one">
        ✿
      </div>

      <div className="floating-flower flower-two">
        ♡
      </div>

      <main className="planner">


        {/* ===============================================
            HEADER
        =============================================== */}

        <header className="header">

          <div>

            <p className="eyebrow">
              MY LITTLE
            </p>

            <h1>
              Daily Planner
            </h1>

            <p className="subtitle">
              little things, one day at a time ♡
            </p>

          </div>


          <div className="header-date">

            <span>
              TODAY
            </span>

            <strong>
              {dateToObject(today).getDate()}
            </strong>

            <small>
              {formatMonth(today)}
            </small>

          </div>

        </header>


        {/* ===============================================
            DATE NAVIGATION
        =============================================== */}

        <section className="date-navigation">

          <button
            className="date-arrow"
            onClick={goPreviousDay}
          >
            ‹
          </button>


          <div className="selected-date">

            <span>
              {selectedDate === today
                ? "Today"
                : "Selected day"}
            </span>

            <strong>
              {formatDate(selectedDate)}
            </strong>

          </div>


          <button
            className="date-arrow"
            onClick={goNextDay}
            disabled={
              selectedDate === today
            }
          >
            ›
          </button>


          <input
            type="date"
            value={selectedDate}
            max={today}
            onChange={(event) =>
              goToDate(
                event.target.value
              )
            }
          />

        </section>


        {/* ===============================================
            TABS
        =============================================== */}

        <nav className="tabs">

          <button
            className={
              activeTab === "today"
                ? "active"
                : ""
            }
            onClick={() => {

              setActiveTab("today");

              setSelectedDate(today);

            }}
          >
            ✿ Today
          </button>


          <button
            className={
              activeTab === "history"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("history")
            }
          >
            ♡ History

            {previousDates.length >
              0 && (

              <span className="tab-count">
                {previousDates.length}
              </span>

            )}

          </button>

        </nav>


        {/* ===============================================
            TODAY VIEW
        =============================================== */}

        {activeTab === "today" && (

          <>

            {/* ===========================================
                PROGRESS
            =========================================== */}

            <section className="progress-card">

              <div>

                <span>
                  {selectedDate === today
                    ? "TODAY'S PROGRESS"
                    : "DAY'S PROGRESS"}
                </span>

                <strong>
                  {completedTasks} / {totalTasks}
                  {" "}completed
                </strong>

              </div>


              <div className="progress-bar">

                <div
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>


              <small>
                {progress}% of your tasks
                complete ♡
              </small>

            </section>


            {/* ===========================================
                MAIN CHECKLIST
            =========================================== */}

            <section className="planner-section">

              <div className="section-title">

                <div>

                  <p>
                    FOR THE DAY
                  </p>

                  <h2>
                    Things I want to do
                  </h2>

                </div>

                <span>
                  ♡
                </span>

              </div>


              {/* ADD TASK */}

              <form
                className="task-form"
                onSubmit={addTask}
              >

                <input
                  type="text"
                  value={newTask}
                  onChange={(event) =>
                    setNewTask(
                      event.target.value
                    )
                  }
                  placeholder="Add something you'd like to accomplish..."
                />


                <select
                  value={newPriority}
                  onChange={(event) =>
                    setNewPriority(
                      event.target.value
                    )
                  }
                >

                  <option value="high">
                    🔴 High
                  </option>

                  <option value="medium">
                    🟡 Medium
                  </option>

                  <option value="low">
                    🟢 Low
                  </option>

                </select>


                <button
                  type="submit"
                >
                  + Add
                </button>

              </form>


              {/* LEGEND */}

              <div className="priority-legend">

                <span>
                  <i className="priority-dot high" />
                  High priority
                </span>

                <span>
                  <i className="priority-dot medium" />
                  Medium
                </span>

                <span>
                  <i className="priority-dot low" />
                  Low
                </span>

              </div>


              {/* TASKS */}

              <div className="tasks">

                {currentDay.tasks.length ===
                0 ? (

                  <div className="empty-tasks">

                    <div>
                      ♡
                    </div>

                    <h3>
                      A fresh little day
                    </h3>

                    <p>
                      Add your first task
                      above.
                    </p>

                  </div>

                ) : (

                  currentDay.tasks.map(
                    (task) => (

                      <div
                        className={`task ${
                          task.completed
                            ? "task-completed"
                            : ""
                        }`}
                        key={task.id}
                      >

                        <label className="check">

                          <input
                            type="checkbox"
                            checked={
                              task.completed
                            }
                            onChange={() =>
                              toggleTask(
                                task.id
                              )
                            }
                          />

                          <span>
                            {task.completed &&
                              "✓"}
                          </span>

                        </label>


                        <div
                          className={`task-priority ${task.priority}`}
                        />


                        <div className="task-name">

                          <span>
                            {task.text}
                          </span>

                        </div>


                        <select
                          className={`task-priority-select ${task.priority}`}
                          value={
                            task.priority
                          }
                          onChange={(event) =>
                            changePriority(
                              task.id,
                              event.target
                                .value
                            )
                          }
                        >

                          <option value="high">
                            High
                          </option>

                          <option value="medium">
                            Medium
                          </option>

                          <option value="low">
                            Low
                          </option>

                        </select>


                        <button
                          className="delete-task"
                          onClick={() =>
                            deleteTask(
                              task.id
                            )
                          }
                        >
                          ×
                        </button>

                      </div>

                    )
                  )

                )}

              </div>

            </section>


            {/* ===========================================
                TWO COLUMN PLANNER GRID
            =========================================== */}

            <section className="planner-grid">


              {/* MOOD */}

              <div className="card mood-card">

                <CardTitle
                  eyebrow="HOW AM I FEELING?"
                  title="Mood"
                  icon="♡"
                />

                <div className="moods">

                  {MOODS.map(
                    (mood) => (

                      <button
                        key={mood.value}
                        className={
                          currentDay.mood ===
                          mood.value
                            ? "selected"
                            : ""
                        }
                        onClick={() =>
                          updateDay({
                            mood:
                              mood.value,
                          })
                        }
                        title={
                          mood.label
                        }
                      >

                        <span>
                          {mood.icon}
                        </span>

                      </button>

                    )
                  )}

                </div>

              </div>


              {/* SLEEP */}

              <div className="card">

                <CardTitle
                  eyebrow="REST"
                  title="Hours of sleep"
                  icon="✦"
                />

                <div className="sleep-input">

                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    placeholder="0"
                    value={
                      currentDay.sleep
                        .hours
                    }
                    onChange={(event) =>
                      updateSleep(
                        "hours",
                        event.target.value
                      )
                    }
                  />

                  <span>
                    hours
                  </span>

                </div>


                <p className="mini-label">
                  How rested I feel
                </p>

                <div className="rest-stars">

                  {[1, 2, 3, 4, 5].map(
                    (number) => (

                      <button
                        key={number}
                        className={
                          currentDay.sleep
                            .rested >=
                          number
                            ? "filled"
                            : ""
                        }
                        onClick={() =>
                          updateSleep(
                            "rested",
                            number
                          )
                        }
                      >
                        ✦
                      </button>

                    )
                  )}

                </div>

              </div>


              {/* WATER */}

              <div className="card">

                <CardTitle
                  eyebrow="HYDRATION"
                  title="Water"
                  icon="♡"
                />

                <div className="water-tracker">

                  <button
                    type="button"
                    className="water-adjust"
                    aria-label="Remove one glass of water"
                    disabled={currentDay.water === 0}
                    onClick={() =>
                      updateDay({
                        water: Math.max(0, currentDay.water - 1),
                      })
                    }
                  >
                    −
                  </button>

                  <span className="water-total">
                    <strong>{currentDay.water}</strong>
                    <span>glasses</span>
                  </span>

                  <button
                    type="button"
                    className="water-adjust water-add"
                    aria-label="Add one glass of water"
                    onClick={() =>
                      updateDay({
                        water: currentDay.water + 1,
                      })
                    }
                  >
                    +
                  </button>

                </div>

                <p className="water-count">
                  {currentDay.water === 1
                    ? "1 glass today"
                    : `${currentDay.water} glasses today`}
                </p>

              </div>


              {/* EXERCISE */}

              <div className="card">

                <CardTitle
                  eyebrow="MOVE YOUR BODY"
                  title="Exercise"
                  icon="✿"
                />

                <input
                  className="simple-input"
                  placeholder="Workout"
                  value={
                    currentDay.exercise
                      .workout
                  }
                  onChange={(event) =>
                    updateExercise(
                      "workout",
                      event.target.value
                    )
                  }
                />

                <div className="small-input-row">

                  <input
                    className="simple-input"
                    type="number"
                    placeholder="Minutes"
                    value={
                      currentDay.exercise
                        .minutes
                    }
                    onChange={(event) =>
                      updateExercise(
                        "minutes",
                        event.target.value
                      )
                    }
                  />

                  <input
                    className="simple-input"
                    type="number"
                    placeholder="Steps"
                    value={
                      currentDay.exercise
                        .steps
                    }
                    onChange={(event) =>
                      updateExercise(
                        "steps",
                        event.target.value
                      )
                    }
                  />

                </div>

              </div>


              {/* GRATITUDE */}

              <div className="card large-card">

                <CardTitle
                  eyebrow="A LITTLE GRATITUDE"
                  title="Today I'm grateful for..."
                  icon="♡"
                />

                <textarea
                  placeholder="Something good from today..."
                  value={
                    currentDay.gratitude
                  }
                  onChange={(event) =>
                    updateDay({
                      gratitude:
                        event.target.value,
                    })
                  }
                />

              </div>


              {/* MEALS */}

              <div className="card">

                <CardTitle
                  eyebrow="FOOD"
                  title="Meal tracker"
                  icon="✿"
                />

                <div className="meal-grid">

                  <MealInput
                    label="Breakfast"
                    value={
                      currentDay.meals
                        .breakfast
                    }
                    onChange={(value) =>
                      updateMeals(
                        "breakfast",
                        value
                      )
                    }
                  />

                  <MealInput
                    label="Lunch"
                    value={
                      currentDay.meals
                        .lunch
                    }
                    onChange={(value) =>
                      updateMeals(
                        "lunch",
                        value
                      )
                    }
                  />

                  <MealInput
                    label="Dinner"
                    value={
                      currentDay.meals
                        .dinner
                    }
                    onChange={(value) =>
                      updateMeals(
                        "dinner",
                        value
                      )
                    }
                  />

                  <MealInput
                    label="Snacks"
                    value={
                      currentDay.meals
                        .snacks
                    }
                    onChange={(value) =>
                      updateMeals(
                        "snacks",
                        value
                      )
                    }
                  />

                </div>

              </div>


              {/* MONEY */}

              <div className="card">

                <CardTitle
                  eyebrow="MONEY"
                  title="Money tracker"
                  icon="♡"
                />

                <div className="money-grid">
                  <div>
                    <label>
                      Money spent (₹)
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      aria-label="Amount spent in rupees"
                      placeholder="₹ 0"
                      value={
                        currentDay.money
                          .out
                      }
                      onChange={(event) =>
                        updateMoney(
                          "out",
                          event.target
                            .value
                        )
                      }
                    />

                    <input
                      aria-label="What the money was spent on"
                      placeholder="Spent on"
                      value={
                        currentDay.money
                          .outFrom
                      }
                      onChange={(event) =>
                        updateMoney(
                          "outFrom",
                          event.target
                            .value
                        )
                      }
                    />

                  </div>

                </div>

              </div>


              {/* NOTES */}

              <div className="card large-card">

                <CardTitle
                  eyebrow="JOURNAL"
                  title="Notes"
                  icon="✿"
                />

                <textarea
                  placeholder="Write anything you want to remember..."
                  value={
                    currentDay.notes
                  }
                  onChange={(event) =>
                    updateDay({
                      notes:
                        event.target.value,
                    })
                  }
                />

              </div>


              {/* TOMORROW */}

              <div className="card large-card">

                <CardTitle
                  eyebrow="LOOKING AHEAD"
                  title="For tomorrow"
                  icon="♡"
                />

                <textarea
                  placeholder="Things I want to remember for tomorrow..."
                  value={
                    currentDay.tomorrow
                  }
                  onChange={(event) =>
                    updateDay({
                      tomorrow:
                        event.target.value,
                    })
                  }
                />

              </div>

            </section>

          </>

        )}


        {/* ===============================================
            HISTORY
        =============================================== */}

        {activeTab === "history" && (

          <section className="history">

            <div className="section-title">

              <div>

                <p>
                  YOUR JOURNEY
                </p>

                <h2>
                  Previous days
                </h2>

              </div>

              <span>
                ♡
              </span>

            </div>


            {previousDates.length ===
            0 ? (

              <div className="empty-history">

                <div>
                  ✿
                </div>

                <h3>
                  Your history starts today
                </h3>

                <p>
                  Previous days will
                  automatically appear here.
                </p>

              </div>

            ) : (

              <div className="history-list">

                {previousDates.map(
                  (date) => {

                    const day =
                      data[date];

                    const total =
                      day.tasks.length;

                    const completed =
                      day.tasks.filter(
                        (task) =>
                          task.completed
                      ).length;

                    const short =
                      formatShortDate(
                        date
                      );

                    return (

                      <article
                        className="history-card"
                        key={date}
                      >

                        <button
                          className="history-card-header"
                          onClick={() =>
                            goToDate(
                              date
                            )
                          }
                        >

                          <div className="history-date-box">

                            <span>
                              {short.day}
                            </span>

                            <strong>
                              {short.date}
                            </strong>

                            <small>
                              {short.month}
                            </small>

                          </div>


                          <div className="history-date-text">

                            <span>
                              {date ===
                              changeDate(
                                today,
                                -1
                              )
                                ? "Yesterday"
                                : formatDate(
                                    date
                                  )}
                            </span>

                            <strong>
                              {completed} /{" "}
                              {total} tasks
                              completed
                            </strong>

                          </div>


                          <div className="history-arrow">
                            →
                          </div>

                        </button>


                        <div className="history-task-list">

                          {day.tasks.length ===
                          0 ? (

                            <p className="no-history-tasks">
                              No tasks added
                              this day.
                            </p>

                          ) : (

                            day.tasks.map(
                              (task) => (

                                <div
                                  className={`history-task ${
                                    task.completed
                                      ? "done"
                                      : ""
                                  }`}
                                  key={
                                    task.id
                                  }
                                >

                                  <span
                                    className={`history-priority ${task.priority}`}
                                  />

                                  <span>
                                    {task.text}
                                  </span>

                                  {task.completed && (
                                    <b>
                                      ✓
                                    </b>
                                  )}

                                </div>

                              )
                            )

                          )}

                        </div>

                      </article>

                    );

                  }
                )}

              </div>

            )}

          </section>

        )}


        {/* ===============================================
            FOOTER
        =============================================== */}

        <footer>

          <span>
            made for little everyday wins
          </span>

          <span>
            ♡
          </span>

        </footer>

      </main>

    </div>
  );
}


/* =====================================================
   REUSABLE CARD TITLE
===================================================== */

function CardTitle({
  eyebrow,
  title,
  icon,
}) {

  return (

    <div className="card-title">

      <div>

        <p>
          {eyebrow}
        </p>

        <h3>
          {title}
        </h3>

      </div>

      <span>
        {icon}
      </span>

    </div>

  );
}


/* =====================================================
   MEAL INPUT
===================================================== */

function MealInput({
  label,
  value,
  onChange,
}) {

  return (

    <div className="meal-input">

      <label>
        {label}
      </label>

      <input
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder="..."
      />

    </div>

  );
}