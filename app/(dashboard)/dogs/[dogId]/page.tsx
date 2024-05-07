"use client"

import Loader from '@/components/custom ui/Loader'
import DogForm from '@/components/dogs/DogForm'
import React, { useEffect, useState } from 'react'

const DogDetails = ({ params }: { params: { dogId: string }}) => {
  const [loading, setLoading] = useState(true)
  const [dogDetails, setDogDetails] = useState<DogType | null>(null)

  const getDogDetails = async () => {
    try { 
      const res = await fetch(`/api/dogs/${params.dogId}`, {
        method: "GET"
      })
      const data = await res.json()
      setDogDetails(data)
      setLoading(false)
    } catch (err) {
      console.log("[dogId_GET]", err)
    }
  }

  useEffect(() => {
    getDogDetails()
  }, [])

  return loading ? <Loader /> : (
    <DogForm initialData={dogDetails} />
  )
}

export default DogDetails