import Dog from "@/lib/models/Dog";
import { connectToDB } from "@/lib/mongoDB";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, { params }: { params: { dogId: string } }) => {
  try {
    await connectToDB()

    const dog = await Dog.findById(params.dogId)

    if (!dog) {
      return new NextResponse(JSON.stringify({ message: "Dog not found" }), { status: 404 })
    }

    const otherDogs = await Dog.find({
      $or: [
        { category: dog.category },
        { collections: { $in: dog.collections }}
      ],
      _id: { $ne: dog._id } // Exclude the current product
    })

    if (!otherDogs) {
      return new NextResponse(JSON.stringify({ message: "No other Dogs found" }), { status: 404 })
    }

    return NextResponse.json(otherDogs, { status: 200 })
  } catch (err) {
    console.log("[related_GET", err)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export const dynamic = "force-dynamic";
