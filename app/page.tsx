"use client";
import Image from "next/image";
import {useDonate} from "@/hooks/useDonate";

export default function Home() {
  const { count, donate } = useDonate();

  return (
    <div className="flex flex-col items-center justify-center gap-4 min-h-screen">
      <h1 className="text-2xl font-bold">Wellcome to Versera Lyrics!</h1>
      <p className="text-center text-gray-500">
        {count}$
      </p>
      <button 
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={donate}  
      >
        Donate
      </button>
    </div>
  );
}
