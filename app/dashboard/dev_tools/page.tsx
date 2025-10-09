'use client'

import React, { useEffect, useState, useContext } from 'react'

import { DashboardContext } from '../layout'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { collectionType } from '@/components/table-columns'

import { collection, addDoc, GeoPoint, Timestamp, getDoc, doc, Firestore, FieldValue, serverTimestamp } from 'firebase/firestore'
import { db } from '@/app/firebase/config'

import { Button, } from '@/components/ui/button'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const placeholderLocations = [
  { lat: 14.679977136721718, lng: 120.98180263019617 }, // Teaspoon Cafe
  { lat: 14.685919446827056, lng: 120.97709972025366 }, // SM Valenzuela
  { lat: 14.681146052058981, lng: 120.97928076923759 },  // RISE Tower
  { lat: 14.692351505257278, lng: 120.97011171525452 }, // People's Park
  { lat: 14.674675827289464, lng: 120.98724023964802 }, // Marulas Barangay Hall
  { lat: 14.68668680230534, lng: 120.98445001103455}, // Arbortowne Plaza

]


const placeholderIds = [
  'ab1dfRTjp6dMld8oqJ6A',
  '736ZoveuVTkeEKZuzWqt',
  'VO6reFK6tgMFdSyZ1g4T',
  '5K7j9kAaPB7Ot762B9Qz',
  'CqSSth9gKOZE8lFZHC3N',
  'uNwwU8SAJszhGDuUvCGS',
  '3ZUhBGQ5SeEZkk8NY66c',
  'IKpbUuqlNUwJil2TLVnY',
  'XgxixcwU25QNifpzuS5s',
  'GuV2zdXha18Zth2gMZaP',
  '7kdvln1CdaLBAyzIvsaV',
  'puYpS474dj3aubRg6Ngs',
  'dme38LdfEv1CCD5vmOa8',
  'dPUsH1PIER7ERSIK0Lle',
  'VDp961R4ifmb2s9LMnaC',
  'RDXq6B0ys01O6Fle5nCo',
  '10tWdX4owkW6Hz58EUdW',
  'Jgqn41vjcotBlqA1Ccbz',
  'ptvDjZONtx3TwW76WdPI',
  'D6AxCCnGVfq4qzyXdluf'
]

const redeemTransactionTitles = [
  'Redeem eggplant seeds',
  'Redeem sunflower seeds',
  'Redeem gumamela seeds',
  'Redeem tomato seeds',
  'Redeem chili seeds',
  'Redeem wooden cutleries',
  'Redeem ecobag',
  'Redeem glass jar',
  'Redeem bamboo toothbrush',
]

const depositTransactionTitles = [
  'Dropped UCO at collection point',
  'Household collection',
]

const voucherRewards = [
  'Eggplant Seeds',
  'Sunflower Seeds',
  'Gumamela Seeds',
  'Tomato Seeds',
  'Chili Seeds',
  'Wooden Cutleries',
  'Ecobag',
  'Glass Jar',
  'Bamboo Toothbrush',
]

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

const userData = {
  firstName: 'Aegon',
  lastName: 'Targaryen',
  mobileNumber: '+639123450001',
  email: 'aegontargaryen@gmail.com',  // Added email field
  credits: 0,
  createdOn: serverTimestamp(),
  address: {
    barangay: 'Karuhatan',
    street: '485 Dragonstone St.',
    city: 'Valenzuela City',
    region: 'National Capital Region (NCR)',
  },
}




export default function Users() {
  
  const [requestIdInput, setRequestIdInput] = useState('')

  const [transactionAmount, setTransactionAmount] = useState('')
  const [transactionUserId, setTransactionUserId] = useState('')

  const [voucherQuantity, setVoucherQuantity] = useState('')
  
  const { usersData } = useContext(DashboardContext)
  
  function getUserIds() {
    usersData.map((user) => {
      console.log(`${user.firstName} ${user.lastName}: ${user.userId}`)
    })
  }

  async function addRequest(id: string) {
    try {
      
      const userRef = doc(db, 'ecollector_users', `${id}`)

      const userDoc = await getDoc(userRef)
      const userData = userDoc.data()
      
      const placedOnDate = serverTimestamp()
      const newDate = new Date()
      const advanceDate = new Date(newDate.setDate(newDate.getDate() + 5))

      if (userDoc.exists() && userData) {
        const randomLocation = placeholderLocations[Math.floor(Math.random() * 6)]

        const addRequest = await addDoc(collection(db, 'ecollector_requests'), {
          address: `${userData.address.street}`,
          collectionDate: advanceDate,
          fullName: `${userData.firstName} ${userData.lastName}`,
          location: new GeoPoint(randomLocation.lat, randomLocation.lng),
          mobileNumber: "+639123456789",
          note: "",
          placedOn: placedOnDate,
          status: "pending",
          userId: id
        });
      }
      setRequestIdInput('')
      console.log('Added request!')
    } catch (e) {
      console.error("Error!", e);
    }
  }

  async function addTransaction(amount: number, type: 'Deposit' | 'Redeem', id?: string) {
    try {
      
      const randomUser = placeholderIds[Math.floor(Math.random() * 20)]

      const userRef = doc(db, 'ecollector_users', `${id ? id : randomUser}`)

      const userDoc = await getDoc(userRef)
      const userData = userDoc.data()
      
      const newDate = new Date()
      const formattedDate = newDate.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });

      if (userDoc.exists() && userData) {
        const addTransaction = await addDoc(collection(db, 'ecollector_transactions'), {
          transactionValue: amount,
          transactionType: type == 'Redeem' ? 'Redeem' : 'Deposit',
          transactionTitle: type == 'Redeem' ? redeemTransactionTitles[Math.floor(Math.random() * 9)] : depositTransactionTitles[Math.floor(Math.random() * 2)],
          transactionDate: randomDate(new Date(2025, 0, 1), new Date()),
          name: `${userData.firstName} ${userData.lastName}`,
          userId: id ? id : randomUser
        });
      }
      setRequestIdInput('')
      console.log('Added transaction!')
    } catch (e) {
      console.error("Error!", e);
    }
  }
  
  // Add voucher
  async function addVoucher(quantity: number, id: string, status: 'Active' | 'Redeemed' | 'Expired') {
    try {
      
      const userRef = doc(db, 'ecollector_users', `${id}`)

      const userDoc = await getDoc(userRef)
      const userData = userDoc.data()
      
      const createdOnDate = new Date()
      const newDate = new Date()
      const advanceDate = new Date(newDate.setDate(newDate.getDate() + 5))
      const randomReward = voucherRewards[Math.floor(Math.random() * 9)]

      if (userDoc.exists() && userData) {
        const addVoucher = await addDoc(collection(db, 'ecollector_vouchers'), {
          voucherTitle: randomReward,
          voucherPrice: quantity * 5,
          voucherQuantity: quantity,
          voucherStatus: status,
          voucherExpiry: advanceDate,
          voucherCreatedOn: serverTimestamp(),
          userId: id,
        });
      }
      setRequestIdInput('')
    } catch (e) {
      console.error("Error!", e);
    }
  }



  return (
    <div className="font-sans flex justify-start-safe items-start-safe p-3 pb-0 gap-5">
      <Card className='w-1/3 h-[8.5rem] p-5 gap-4'>
        <CardHeader>
          <CardTitle>Requests</CardTitle>
          <CardDescription>Add request</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className='w-full' onClick={() => {addRequest(placeholderIds[Math.floor(Math.random() * 20)])}}>Add request</Button>
        </CardFooter>
      </Card>
      <Card className='w-1/3 p-5 gap-4'>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>Add transaction</CardDescription>
        </CardHeader>
        <CardContent className='flex-col w-full h-full'>
          <Label className='mb-1'>User ID</Label>
          <Input value={transactionUserId} onChange={text => setTransactionUserId(text.target.value)}/>
          <Label className='mb-1 mt-3'>Transaction Amount</Label>
          <Input value={transactionAmount} onChange={text => setTransactionAmount(text.target.value)}/>
        </CardContent>
        <CardFooter className='flex-col gap-3'>
          <Button className='w-full bg-green-700 hover:bg-green-600' onClick={() => {addTransaction(parseInt(transactionAmount), 'Deposit', transactionUserId)}} disabled={(transactionAmount === '')} >Add Deposit Transaction</Button>
          <Button className='w-full bg-red-700 hover:bg-red-600' onClick={() => {addTransaction(parseInt(transactionAmount), 'Redeem', transactionUserId)}} disabled={(transactionAmount === '')} >Add Redeem Transaction</Button>
        </CardFooter>
      </Card>
      <Card className='w-1/3 h-[13rem] p-5 gap-4'>
        <CardHeader>
          <CardTitle>Vouchers</CardTitle>
          <CardDescription>Add transaction</CardDescription>
        </CardHeader>
        <CardContent className='flex-col w-full h-full'>
          <Label className='mb-1'>Reward Quantity</Label>
          <Input value={voucherQuantity} onChange={text => setVoucherQuantity(text.target.value)}/>
        </CardContent>
        <CardFooter className='flex-col gap-3'>
          <Button className='w-full' onClick={() => {addVoucher(parseInt(voucherQuantity), placeholderIds[Math.floor(Math.random() * 20)], 'Active')}}>Add voucher</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
