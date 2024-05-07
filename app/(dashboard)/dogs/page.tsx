"use client";


import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import Loader from "@/components/custom ui/Loader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/custom ui/DataTable";
import { columns } from "@/components/dogs/DogColumns";

const Dogs = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [dogs, setDogs] = useState<DogType[]>([]);

  const getDogs = async () => {
    try {
      const res = await fetch("/api/dogs", {
        method: "GET",
      });
      const data = await res.json();
      setDogs(data);
      setLoading(false);
    } catch (err) {
      console.log("[dogs_GET]", err);
    }
  };

  useEffect(() => {
    getDogs();
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <div className="px-10 py-5 bg-black">
      <div className="flex items-center justify-between">
        <p className="text-heading2-bold">Dogs</p>
        <Button
          className="bg-blue-1 text-white"
          onClick={() => router.push("/dogs/new")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Dog
        </Button>
      </div>
      <Separator className="bg-grey-1 my-4" />
      <DataTable columns={columns} data={dogs} searchKey="title" />
    </div>
  );
};

export default Dogs;
