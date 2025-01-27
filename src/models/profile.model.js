import mongoose, { Schema } from "mongoose";

const profileSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
    },
    about: {
      type: String,
    },
    viwes: {
      type: Number,
      default: 0,
    },
    githubUrl: {
      type: String,
    },
    linkedinUrl: {
      type: String,
    },
    links: [
      {
        name: String,
        url: String,
      },
    ],
    experience: [
      {
        title: String,
        company: String,
        startDate: String,
        endDate: String,
        description: String,
      },
    ],
    education: [
      {
        school: String,
        degree: String,
        field: String,
        graduationYear: String,
      },
    ],
    location: {type: String},
    skills: [String],
  },
  {
    timestamps: true,
  },
);

export const Profile = mongoose.model("Profile", profileSchema);
