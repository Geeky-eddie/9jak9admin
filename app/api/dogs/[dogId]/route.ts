import Collection from "@/lib/models/Collection";
import Dog from "@/lib/models/Dog";
import { connectToDB } from "@/lib/mongoDB";
import { auth } from "@clerk/nextjs";

import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { dogId: string } }
) => {
  try {
    await connectToDB();

    const dog = await Dog.findById(params.dogId).populate({
      path: "collections",
      model: Collection,
    });

    if (!dog) {
      return new NextResponse(
        JSON.stringify({ message: "dog not found" }),
        { status: 404 }
      );
    }
    return new NextResponse(JSON.stringify(dog), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": `${process.env.ECOMMERCE_STORE_URL}`,
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (err) {
    console.log("[dogId_GET]", err);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export const POST = async (
  req: NextRequest,
  { params }: { params: { dogId: string } }
) => {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();

    const dog = await Dog.findById(params.dogId);

    if (!dog) {
      return new NextResponse(
        JSON.stringify({ message: "dog not found" }),
        { status: 404 }
      );
    }

    const {
      title,
      description,
      media,
      category,
      collections,
      tags,
      sizes,
      colors,
      price,
      expense,
    } = await req.json();

    if (!title || !description || !media || !category || !price || !expense) {
      return new NextResponse("Not enough data to create a new dog", {
        status: 400,
      });
    }

    const addedCollections = collections.filter(
      (collectionId: string) => !dog.collections.includes(collectionId)
    );
    // included in new data, but not included in the previous data

    const removedCollections = dog.collections.filter(
      (collectionId: string) => !collections.includes(collectionId)
    );
    // included in previous data, but not included in the new data

    // Update collections
    await Promise.all([
      // Update added collections with this dog
      ...addedCollections.map((collectionId: string) =>
        Collection.findByIdAndUpdate(collectionId, {
          $push: { dogs: dog._id },
        })
      ),

      // Update removed collections without this dog
      ...removedCollections.map((collectionId: string) =>
        Collection.findByIdAndUpdate(collectionId, {
          $pull: { dogs: dog._id },
        })
      ),
    ]);

    // Update dog
    const updatedDog = await Dog.findByIdAndUpdate(
      dog._id,
      {
        title,
        description,
        media,
        category,
        collections,
        tags,
        sizes,
        colors,
        price,
        expense,
      },
      { new: true }
    ).populate({ path: "collections", model: Collection });

    await updatedDog.save();

    return NextResponse.json(updatedDog, { status: 200 });
  } catch (err) {
    console.log("[dogId_POST]", err);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { dogId: string } }
) => {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();

    const dog = await Dog.findById(params.dogId);

    if (!dog) {
      return new NextResponse(
        JSON.stringify({ message: "dog not found" }),
        { status: 404 }
      );
    }

    await Dog.findByIdAndDelete(dog._id);

    // Update collections
    await Promise.all(
      dog.collections.map((collectionId: string) =>
        Collection.findByIdAndUpdate(collectionId, {
          $pull: { dogs: dog._id },
        })
      )
    );

    return new NextResponse(JSON.stringify({ message: "dog deleted" }), {
      status: 200,
    });
  } catch (err) {
    console.log("[dogId_DELETE]", err);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export const dynamic = "force-dynamic";

