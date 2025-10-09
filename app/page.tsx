"use client"

import { auth } from './firebase/config'
import { signInWithEmailAndPassword } from 'firebase/auth';
import { UserCredential } from 'firebase/auth';

import { useRouter } from 'next/navigation';

import Image from "next/image";

import { AuthContext } from './layout'

import { useForm } from 'react-hook-form'
import { z } from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircleIcon } from "lucide-react";
import { useState, useContext, useEffect } from "react";
import { addUsers } from './firebase/dummy_users';

const formSchema = z.object({
  email: z.email(),
  password: z.string().min(1, {message: 'Please enter a password'})
})

export default function Login() {

  // Authentication state context
  const { userId, setUserId } = useContext(AuthContext)

  //Router
  const router = useRouter()

  // Form
  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  // Function for log in button (handleOnSubmit)
  async function onSubmit(data: z.infer<typeof formSchema>) {
    console.log('Username: ', data.email)
    console.log('Password: ', data.password)

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password)
      .then((userCredentials) => {
        router.push('./dashboard')
        setUserId(userCredentials.user.uid)
        console.log('Logged in as', userCredentials.user)
      })
      .catch((error) => {
        if (error.code === 'auth/invalid-credential') {
          form.setError('root', {message: 'Invalid email or password!'})
        } else {
          form.setError('root', {message: `${error.code}`})
        }
      })
    } catch {
      form.setError('root', {message: "Trouble logging right now, try again later!"})
    }
  }


  return (
    <div className="font-sans flex justify-center-safe items-center-safe min-h-screen">
      <Card className='w-90 gap-5'>
        <CardHeader className='flex flex-col items-center'>
          <Image
            src='/ecollector-admin-logo.png'
            width={200}
            height={200}
            alt='Ecollector logo'
          />
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-3">
                <FormField control={form.control} name={'email'}
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name={'password'}
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input {...field} type='password' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
              </div>
              <Button type='submit' className="mt-4 mb-4  w-full">Log in</Button>
              { form.formState.errors.root && 
                <Alert variant='destructive' className="border-red-400 bg-red-100">
                  <AlertCircleIcon />
                  <AlertTitle>Incorrect credentials</AlertTitle>
                  <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
                </Alert>
              }
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
