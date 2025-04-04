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
    const { title, description, category, price, capacity, schedule } = req.body;

    // 🔹 Validate Schedule Type
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
      // Validate Recurrent Schedule fields
      if (!schedule.startDate || !schedule.endDate || !Array.isArray(schedule.enabledDays) || schedule.enabledDays.length === 0) {
        return res.status(400).json({ message: "Recurrent schedule must have a start date, end date, and at least one selected day." });
      }

      const startDate = new Date(schedule.startDate);
      const endDate = new Date(schedule.endDate);
      const enabledDays = schedule.enabledDays || [];  // Ensure this is an array
      const sessions = [];

      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateString = currentDate.toLocaleDateString("en-CA"); // Ensures YYYY-MM-DD format
        const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" });

        // Use .includes() to check if the dayName is in the enabledDays array
        if (enabledDays.includes(dayName)) {
          // Filter timeSlots where the day matches
          const daySlots = schedule.timeSlots.filter(slot => slot.day === dayName);

          daySlots.forEach((slot, index) => {
            sessions.push({
              date: dateString,
              day: slot.day,
              startTime: slot.startTime,
              endTime: slot.endTime,
            });
          });
        }

        // Move to the next date
        currentDate.setDate(currentDate.getDate() + 1);
      }

      formattedTimeSlots = sessions;  // Assign the created sessions to formattedTimeSlots

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
        timeSlots: formattedTimeSlots,  // Add the formatted time slots here
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
    console.error("Error creating class:", error);
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
  console.log("🔹 Received Update Payload:", req.body);

  try {
    const fitnessClass = await Class.findById(classId);
    if (!fitnessClass) return res.status(404).json({ message: "Class not found" });

    // 🔹 Prevent empty time slots update
    if (fitnessClass.schedule.scheduleType === "Recurrent" && (!recurringTimeSlots || recurringTimeSlots.length === 0)) {
      return res.status(400).json({ message: "Recurring time slots cannot be empty." });
    }
    // if (!newDate && !fitnessClass.schedule.oneTimeDate) {
    //   return res.status(400).json({ message: "One-time class requires a valid date." });
    // }
    // 🔹 Handle One-time class update
    if (fitnessClass.schedule.scheduleType === "One-time") {
      const startTime = newTimeSlot?.startTime || req.body.oneTimeStartTime;
      const endTime = newTimeSlot?.endTime || req.body.oneTimeEndTime;
    
      if (!startTime || !endTime) {
        return res.status(400).json({ message: "One-time class requires valid start and end times." });
      }
    
      fitnessClass.schedule.oneTimeDate = newDate || fitnessClass.schedule.oneTimeDate;
      fitnessClass.schedule.oneTimeStartTime = startTime;
      fitnessClass.schedule.oneTimeEndTime = endTime;
    }
     else {
      // 🔹 Handle Recurrent class update
      if (!Array.isArray(recurringTimeSlots) || recurringTimeSlots.length === 0) {
        return res.status(400).json({ message: "Recurrent schedule must include valid time slots." });
      }

      // 🔹 Validate each recurring time slot
      const validTimeSlots = recurringTimeSlots.filter(slot => slot.date &&slot.day && slot.startTime && slot.endTime);
      if (validTimeSlots.length !== recurringTimeSlots.length) {
        return res.status(400).json({ message: "Each recurring time slot must have a date, startTime, and endTime." });
      }

      // 🔹 Update a particular slot (if `updatedSlot` is provided)
      // Update a specific time slot if 'updatedSlot' is provided
      if (updatedSlot) {
        console.log("📌 Updated Slot Received:", updatedSlot);
      
        if (!updatedSlot.id) {
          console.log("❌ Error: updatedSlot.id is missing!");
          return res.status(400).json({ message: "Invalid request: Missing updatedSlot.id" });
        }
      
        const slotIndex = fitnessClass.schedule.timeSlots.findIndex(
          slot => slot._id.toString() === updatedSlot.id.toString()
        );
      
        if (slotIndex !== -1) {
          // Update the found slot
          fitnessClass.schedule.timeSlots[slotIndex] = {
            ...fitnessClass.schedule.timeSlots[slotIndex],
            startTime: updatedSlot.startTime,
            endTime: updatedSlot.endTime,
            date: new Date(updatedSlot.date),
          };
        } else {
          console.log("❌ No match found for _id:", updatedSlot.id);
          return res.status(404).json({ message: "Time slot not found for update." });
        }
      }
      
       else {
        // ✅ Merge new slots without deleting existing ones
        validTimeSlots.forEach((newSlot) => {
          const existingSlotIndex = fitnessClass.schedule.timeSlots.findIndex(
            slot => slot.date.toISOString() === new Date(newSlot.date).toISOString()
          );
      
          if (existingSlotIndex !== -1) {
            // 🔹 Update existing slot
            fitnessClass.schedule.timeSlots[existingSlotIndex] = {
              ...fitnessClass.schedule.timeSlots[existingSlotIndex],
              startTime: newSlot.startTime,
              endTime: newSlot.endTime,
            };
          } else {
            // 🔹 Add new slot without deleting others
            fitnessClass.schedule.timeSlots.push({
              date: new Date(newSlot.date),
              day: newSlot.day,
              startTime: newSlot.startTime,
              endTime: newSlot.endTime,
            });
          }
        });
      }
      

    }

    await fitnessClass.save();

    res.status(200).json({ message: "Class updated successfully!", updatedClass: fitnessClass });
  } catch (error) {
    console.error("Error updating class:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};




// @desc    Delete a class
// @route   DELETE /api/classes/:id
// @access  Trainer only
exports.deleteClass = async (req, res) => {
  try {
    const classToDelete = await Class.findById(req.params.classId);
    
    if (!classToDelete) {
      return res.status(404).json({ message: "Class not found" });
    }

    // ✅ Remove the class from all user bookings (if applicable)
    await Class.deleteMany({ classId: req.params.classId });

    // ✅ Optional: Notify users about the cancellation (if emails are implemented)
    // await sendCancellationEmails(classToDelete);

    await Class.findByIdAndDelete(req.params.classId);
    
    res.json({ message: "Class canceled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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
