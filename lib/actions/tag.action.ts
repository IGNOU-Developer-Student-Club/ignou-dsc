"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../db/mongoose";
import {
  GetAllTagsParams,
  GetQuestionsByTagIdParams,
  GetTopInteractedTagsParams,
} from "./shared.types";
import Tag, { ITag } from "@/database/tag.model";
import { FilterQuery } from "mongoose";
import Question from "@/database/questions.model";

export const getTopInteractedTags = async (
  params: GetTopInteractedTagsParams
) => {
  try {
    connectToDatabase();

    const { userId } = params;
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // todo: Find interactions for the user and group by tags

    // todo : Interdaction (save to database)

    return [
      { _id: "1", name: "tag" },
      { _id: "2", name: "tag2" },
      { _id: "3", name: "tag3" },
    ];
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getAllTags = async (params: GetAllTagsParams) => {
  try {
    connectToDatabase();

    // const { page, filter, pageSize, searchQuery } = params;
    const { searchQuery } = params;

    const query: FilterQuery<typeof Tag> = {};

    if (searchQuery) {
      query.$or = [{ name: { $regex: new RegExp(searchQuery, "i") } }];
    }

    const tags = await Tag.find(query).sort({ createdAt: -1 });

    return { tags };

    // get user by id
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getQuestionsByTagId = async (
  params: GetQuestionsByTagIdParams
) => {
  try {
    connectToDatabase();
    // const { tagId, page = 1, pageSize = 10, searchQuery } = params;
    const { tagId, searchQuery } = params;

    const tagFilter: FilterQuery<ITag> = { _id: tagId };
    if (searchQuery) {
      tagFilter.$or = [{ $regex: searchQuery, $option: "i" }];
    }

    const tag = await Tag.findOne(tagFilter).populate({
      path: "questions",
      model: Question,
      match: searchQuery
        ? { title: { $regex: searchQuery, $options: "i" } }
        : {},
      populate: [
        { path: "tags", model: Tag, select: "_id name" },
        { path: "author", model: User, select: "_id clerkId name picture" },
      ],
    });

    if (!tag) {
      throw new Error("Tag not found");
    }
    console.log(tag);

    const questions = tag.questions;

    return { tagTitle: tag.name, questions };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getTopPopularTags = async () => {
  try {
    connectToDatabase();

    const popularTags = await Tag.aggregate([
      {
        $project: { name: 1, numberOfQuestions: { $size: "$questions" } },
      },
      { $sort: { numberOfQuestions: -1 } },
      { $limit: 10 },
    ]);

    return popularTags;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
