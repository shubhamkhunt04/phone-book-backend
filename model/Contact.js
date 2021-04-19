const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contactSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
      trim: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      require: true,
      trim: true, 
    },
    company: {
      type: String,
      trim: true,
    },
    userId:{
      type: Schema.Types.ObjectId,
      ref: "User",
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Contact', contactSchema);
