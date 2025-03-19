const mongoose = require("mongoose");
const Class = require("../models/Class.js");
const Trainer = require("../models/Trainer.js");
const User = require("../models/User");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
// @desc    Create a new class
// @route   POST /api/classes
// @access  Trainer only
exports.createClass = async (req, res) => {
  try {
    const { title, description, category, duration, price, capacity, schedule } = req.body;

    if (!["One-time", "Recurrent"].includes(schedule.scheduleType)) {
      return res.status(400).json({ message: "Invalid schedule type" });
    }

    // 🔹 Validate One-time Schedule
    if (schedule.scheduleType === "One-time") {
      if (!schedule.oneTimeDate || !schedule.oneTimeStartTime || !schedule.oneTimeEndTime) {
        return res.status(400).json({ message: "One-time schedule must include a date and start/end time." });
      }
    }

    // 🔹 Validate Recurrent Schedule
    let formattedTimeSlots = [];
    if (schedule.scheduleType === "Recurrent") {
      if (!schedule.startDate || !schedule.endDate || !Array.isArray(schedule.enabledDays) || schedule.enabledDays.length === 0) {
        return res.status(400).json({ message: "Recurrent schedule must have start date, end date, and at least one selected day." });
      }

      if (schedule.timeSlots) {
        for (const [day, slots] of Object.entries(schedule.timeSlots)) {
          if (Array.isArray(slots)) {
            slots.forEach(slot => {
              formattedTimeSlots.push({
                date: new Date(slot.date), 
                startTime: slot.startTime,
                endTime: slot.endTime,
              });
            });
          }
        }
      }

      if (!formattedTimeSlots.length) {
        return res.status(400).json({ message: "Recurrent schedule must have at least one valid time slot." });
      }
    }

    // 🔹 Ensure Trainer Exists
    const trainer = await Trainer.findById(req.user._id);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // 🔹 Create New Class
    const newClass = new Class({
      title,
      description,
      category,
      duration,
      price,
      capacity,
      schedule: {
        scheduleType: schedule.scheduleType,
        oneTimeDate: schedule.oneTimeDate || null,
        oneTimeStartTime: schedule.oneTimeStartTime || null,
        oneTimeEndTime: schedule.oneTimeEndTime || null,
        startDate: schedule.startDate || null,
        endDate: schedule.endDate || null,
        enabledDays: schedule.enabledDays || [],
        timeSlots: formattedTimeSlots,
        blockedDates: schedule.blockedDates || [],
      },
      trainer: trainer._id, // Assign trainer
    });

    // 🔹 Save Class & Update Trainer
    await newClass.save();
    trainer.classes.push(newClass._id);
    await trainer.save();

    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};



// @desc    Get all classes
// @route   GET /api/classes
// @access  Public
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate({
      path: "trainer",
      select: "name email",
      options: { strictPopulate: false } // ✅ Prevents errors if trainer is missing
    });
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get a single class by ID
// @route   GET /api/classes/:id
// @access  Public
exports.getClassById = async (req, res) => {
  try {
    const fitnessClass = await Class.findById(req.params.id).populate({
      path: "trainer",
      select: "name email",
      options: { strictPopulate: false } // ✅ Prevents errors if trainer is missing
    });
    if (!fitnessClass) {
      return res.status(404).json({ message: "Class not found" });
    }
    res.status(200).json(fitnessClass);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Update class details
// @route   PUT /api/classes/:id
// @access  Trainer only
exports.updateClass = async (req, res) => {
  const { classId } = req.params;
  const { newDate, newTimeSlot, recurringTimeSlots, updatedSlot } = req.body; // `updatedSlot` indicates which slot to update

  try {
    const fitnessClass = await Class.findById(classId);
    if (!fitnessClass) return res.status(404).json({ message: "Class not found" });

    // Prevent empty time slots update
    if (fitnessClass.schedule.scheduleType === "Recurrent" && (!recurringTimeSlots || recurringTimeSlots.length === 0)) {
      return res.status(400).json({ message: "Recurring time slots cannot be empty." });
    }

    // Handle One-time class update
    if (fitnessClass.schedule.scheduleType === "One-time") {
      if (!newDate || !newTimeSlot?.startTime || !newTimeSlot?.endTime) {
        return res.status(400).json({ message: "One-time class requires a valid date and time slots." });
      }
      fitnessClass.schedule.oneTimeDate = newDate;
      fitnessClass.schedule.oneTimeStartTime = newTimeSlot.startTime;
      fitnessClass.schedule.oneTimeEndTime = newTimeSlot.endTime;
    } else {
      // Handle Recurrent class update
      // Validate each recurring time slot
      // const validTimeSlots = recurringTimeSlots.filter(slot => slot.day && slot.startTime && slot.endTime);
      // Validate each recurring time slot (Changed day -> date)
const validTimeSlots = recurringTimeSlots.filter(slot => slot.date && slot.startTime && slot.endTime);
if (validTimeSlots.length !== recurringTimeSlots.length) {
  return res.status(400).json({ message: "Each recurring time slot must have a date, startTime, and endTime." });
}

// Update a particular slot (Changed day -> date)
if (updatedSlot) {
  const slotIndex = fitnessClass.schedule.timeSlots.findIndex(
    slot => slot.date.toISOString() === new Date(updatedSlot.date).toISOString() && slot.startTime === updatedSlot.startTime
  );

  if (slotIndex !== -1) {
    // Update only the selected slot
    fitnessClass.schedule.timeSlots[slotIndex].startTime = updatedSlot.startTime;
    fitnessClass.schedule.timeSlots[slotIndex].endTime = updatedSlot.endTime;
  } else {
    return res.status(404).json({ message: "Time slot not found for update." });
  }
} else {
  // If no specific slot to update, update all slots (Ensure correct date format)
  fitnessClass.schedule.timeSlots = validTimeSlots.map(slot => ({
    date: new Date(slot.date), // Ensure date is stored properly
    startTime: slot.startTime,
    endTime: slot.endTime,
  }));
}

    }

    await fitnessClass.save();

    res.status(200).json({ message: "Class rescheduled successfully!", updatedClass: fitnessClass });
  } catch (error) {
    console.error("Error rescheduling class:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};




// @desc    Delete a class
// @route   DELETE /api/classes/:id
// @access  Trainer only
exports.deleteClass = async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: "Class cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
// @desc    Get all scheduled classes sorted by date
// @route   GET /api/classes/schedule
// @access  Public or Trainer only (modify as needed)
exports.getScheduledClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate({
        path: "trainer",
        select: "name email",
        options: { strictPopulate: false }
      })
      .lean();

    // Sorting and structuring classes by date
    const sortedEvents = {};

    classes.forEach((cls) => {
      if (cls.schedule.scheduleType === "One-time") {
        const dateKey = new Date(cls.schedule.oneTimeDate).toISOString().split("T")[0];
        if (!sortedEvents[dateKey]) sortedEvents[dateKey] = [];
        sortedEvents[dateKey].push(cls);
      } else if (cls.schedule.scheduleType === "Recurrent") {
        let currentDate = new Date(cls.schedule.startDate);
        const endDate = new Date(cls.schedule.endDate);
        while (currentDate <= endDate) {
          const dayOfWeek = currentDate.toLocaleDateString("en-US", { weekday: "long" });
          if (cls.schedule.enabledDays.includes(dayOfWeek)) {
            const dateKey = currentDate.toISOString().split("T")[0];
            if (!sortedEvents[dateKey]) sortedEvents[dateKey] = [];
            sortedEvents[dateKey].push(cls);
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    });

    // Convert sorted object to an array for easier frontend handling
    const sortedArray = Object.entries(sortedEvents)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
      .map(([date, events]) => ({ date, events }));

    res.status(200).json(sortedArray);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
