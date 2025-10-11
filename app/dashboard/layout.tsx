'use client'

import { createContext, useState, useEffect, useContext } from "react";

import { AuthContext } from "../layout";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import { usePathname } from "next/navigation";

import { collection, onSnapshot, updateDoc, doc} from 'firebase/firestore'
import { db } from '@/app/firebase/config'
import { collectionType, voucherType } from '@/components/table-columns'
import { accountType, transactionType } from "@/components/table-columns";

type Coordinates = {latitude: number, longitude: number}

type DashboardContextType = {
    isLoading: boolean
    usersData: accountType[] | []
    pendingData: collectionType[] | []
    ongoingData: collectionType[] | []
    completedData: collectionType[] | []
    transactionsData: transactionType[] | []
    vouchersData: voucherType[] | []
    pendingCoordinates: Coordinates[] | [],
    ongoingCoordinates: Coordinates[] | [],
    panMapLocation: (location: Coordinates) => void,
    mapLocation: Coordinates,
    centered: boolean,
    setCentered: (boolean: boolean) => void,
    resetCheckedRows: boolean,
    setResetCheckedRows: (boolean: boolean) => void
}
export const DashboardContext = createContext<DashboardContextType>({
    isLoading: true,
    usersData: [],
    pendingData: [],
    ongoingData: [],
    completedData: [],
    transactionsData: [],
    vouchersData: [],
    pendingCoordinates: [],
    ongoingCoordinates: [],
    mapLocation: {latitude: 14.67905870159817, longitude: 120.98307441444432},
    panMapLocation: (location: Coordinates) => {},
    centered: false,
    setCentered: (boolean: boolean) => {},
    resetCheckedRows: false,
    setResetCheckedRows: (boolean: boolean) => {},
})

export default function Layout({ children } : { children: React.ReactNode }) {

    const { userId } = useContext(AuthContext)

    // Fetch data from Firebase
    const [isLoading, setIsLoading] = useState(true)

    const [resetCheckedRows, setResetCheckedRows] = useState(false)

    const [usersData, setUsersData] = useState<accountType[] | []>([])
    const [transactionsData, setTransactionsData] = useState<transactionType[]>([])
    const [pendingData, setPendingData] = useState<collectionType[] | []>([])
    const [vouchersData, setVouchersData] = useState<voucherType[] | []>([])

    const [pendingCoordinates, setPendingCoordinates] = useState<Coordinates[]>([])
    const [ongoingCoordinates, setOngoingCoordinates] = useState<Coordinates[]>([])

    const [ongoingData, setOngoingData] = useState<collectionType[] | []>([])
    const [completedData, setCompletedData] = useState<collectionType[] | []>([])

    const [mapLocation, panMapLocation] = useState({latitude: 14.67905870159817, longitude: 120.98307441444432})
    const [centered, setCentered] = useState(false)

    let requestDocs: collectionType[] = []
    let usersDocs: accountType[] = []
    let transactionsDocs: transactionType[] = []
    let vouchersDocs: voucherType[] = []
    let pendingCoordinateArray: Coordinates[] = []
    let ongoingCoordinateArray: Coordinates[] = []
    const requestsCollection = collection(db, 'ecollector_requests')
    const usersCollection = collection(db, 'ecollector_users')
    const transactionsCollection = collection(db, 'ecollector_transactions')
    const vouchersCollection = collection(db, 'ecollector_vouchers')

    function clearDocs() {
        requestDocs = []
        usersDocs = []
        pendingCoordinateArray = []
        ongoingCoordinateArray = []
        transactionsDocs = []
        vouchersDocs = []
    }

    // Snapshot to fetch all requests
    useEffect(() => {
        const unsubscribeRequests = onSnapshot(requestsCollection, (item) => {
            setIsLoading(true)
            item.forEach((doc) => {
                const docData = doc.data()
                let isOutdated = false
                const requestDate = docData['collectionDate'].toDate()
                const today = new Date()

                // Checks and cancel outdated requests
                if (docData.status === 'pending' || docData.status === 'ongoing') {
                    if ( requestDate.getTime() <= today.getTime() ) {
                        cancelRequest(doc.id)
                        isOutdated = true
                    }
                }

                const entry: collectionType = {
                name: docData['fullName'],
                collection_date: docData['collectionDate'],
                status: isOutdated ? 'cancelled' : docData['status'],
                mobile_number: docData['mobileNumber'],
                placed_on: docData['placedOn'] ? formatTimestamp(docData['placedOn'].toDate(), 'noDay') : '?',
                address: docData['address'],
                collection_id: doc.id,
                location: docData['location'],
                note: docData['note']
            }
            requestDocs.push(entry)
            if (docData['status'] === 'pending') {
                const coordinateValues = {latitude: docData.location.latitude, longitude: docData.location.longitude}
                pendingCoordinateArray.push(coordinateValues)
            } else if (docData['status'] === 'ongoing') {
                const coordinateValues = {latitude: docData.location.latitude, longitude: docData.location.longitude}
                ongoingCoordinateArray.push(coordinateValues)
            } 
            isOutdated = false
        })
        setPendingCoordinates(pendingCoordinateArray)
        setOngoingCoordinates(ongoingCoordinateArray)
        setPendingData(requestDocs.filter((doc) => {return doc.status === 'pending'})
            .sort((a, b) => {return a.collection_date.toDate().getTime() - b.collection_date.toDate().getTime()}))
        setOngoingData(requestDocs.filter((doc) => {return doc.status === 'ongoing'})
            .sort((a, b) => {return a.collection_date.toDate().getTime() - b.collection_date.toDate().getTime()}))
        setCompletedData(requestDocs.filter((doc) => {return doc.status === 'completed' || doc.status === 'rejected' || doc.status === 'cancelled'})
            .sort((a, b) => {return b.collection_date.toDate().getTime() - a.collection_date.toDate().getTime()}))
        clearDocs()
        setIsLoading(false)
        })

        const unsubscribeUsers = onSnapshot(usersCollection, (accounts) => {
            setIsLoading(true)
            accounts.forEach((account) => {
                const docData = account.data()
                const accountDetails: accountType = {
                    firstName: docData.firstName,
                    lastName: docData.lastName,
                    mobileNumber: docData.mobileNumber,
                    email: docData.email,
                    address: docData.address,
                    credits: docData.credits,
                    userId: `${account.id}`,
                    createdOn: docData.createdOn
                }
                usersDocs.push(accountDetails)
            })
            setUsersData(usersDocs)
            clearDocs()
            setIsLoading(false)
        })

        const unsubscribeTransactions = onSnapshot(transactionsCollection, (transactions) => {
            setIsLoading(true)
            transactions.forEach((transaction) => {
                const docData = transaction.data()
                const transactionDetails: transactionType = {
                    transactionId: transaction.id,
                    transactionType: docData.transactionType,
                    transactionTitle: docData.transactionTitle,
                    transactionValue: docData.transactionValue,
                    transactionDate: docData.transactionDate,
                    name: docData.name,
                    userId: docData.userId
                }
                transactionsDocs.push(transactionDetails)
            })
            setTransactionsData(transactionsDocs.sort((a, b) => {return b.transactionDate.toDate().getTime() - a.transactionDate.toDate().getTime()}))
            clearDocs()
            setIsLoading(false)
        })

        const unsubscribeVouchers = onSnapshot(vouchersCollection, (vouchers) => {
            setIsLoading(true)
            vouchers.forEach((voucher) => {
                const docData = voucher.data()
                const voucherDetails: voucherType = {
                    voucherId: voucher.id,
                    voucherTitle: docData.voucherTitle,
                    voucherPrice: docData.voucherPrice,
                    voucherStatus: docData.voucherStatus,
                    voucherExpiry: docData['voucherExpiry'],
                    voucherCreatedOn: docData['voucherCreatedOn'],
                    userId: docData.userId,
                }
                vouchersDocs.push(voucherDetails)
                console.log(voucherDetails)
            })
            setVouchersData(vouchersDocs.sort((a, b) => {return b.voucherCreatedOn.toDate().getTime() - a.voucherCreatedOn.toDate().getTime()}))
            clearDocs()
            setIsLoading(false)
        })

        return () => {
            unsubscribeRequests()
            unsubscribeUsers()
            unsubscribeTransactions()
            unsubscribeVouchers()
        }

    }, [userId])

    // Updates overdue requests (if collection date is already done but still not approved)
    async function cancelRequest(id: string) {
        const docRef = doc(db, 'ecollector_requests', `${id}`)
        
        try {
            await updateDoc(docRef, {status: 'cancelled', note: 'Automatically cancelled due to overdue request.'})
        } catch (error) {
            console.log('Error updating database!', error)
        }
    }

    // Converts to formatted date
    function formatTimestamp(timestamp: Date, format: 'noDay' | 'withDay') {
        const fullDate = timestamp.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'Asia/Singapore'
        }).replace(',' , '')
        const weekday = timestamp.toLocaleDateString('en-US', {
            weekday: 'short',
            timeZone: 'Asia/Singapore'
        })
        return format === 'noDay' ? `${fullDate}` : `${fullDate} (${weekday})`
    }

    // Assigns header title
    function getTitle(path: string) {
        switch (path) {
            case '/dashboard':
                return 'Dashboard'
                break
            case '/dashboard/collections':
                return 'Household Collections'
                break
            case '/dashboard/users':
                return 'Users'
                break
            case '/dashboard/transactions':
                return 'Transactions'
                break
            case '/dashboard/vouchers':
                return 'Vouchers'
                break
            case '/dashboard/dev_tools':
                return 'Dev Tools'
                break
            default:
                return '?'
                break
        }
    }

    const pathname = usePathname()
    const title: string = getTitle(pathname)

    return (
        <DashboardContext.Provider value={{
            isLoading,
            usersData,
            pendingData,
            ongoingData,
            completedData,
            transactionsData,
            vouchersData,
            pendingCoordinates,
            ongoingCoordinates,
            mapLocation,
            panMapLocation,
            resetCheckedRows,
            setResetCheckedRows,
            centered,
            setCentered,
        }}>
            <SidebarProvider>
                <AppSidebar variant="inset" requests={pendingData.length}/>
                <SidebarInset>
                    <main className="flex-1 flex-col flex m-2 mb-0 border-1 border-b-0 rounded-lg rounded-b-none max-h-screen overflow-hidden">
                        <DashboardHeader title={title} />
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </DashboardContext.Provider>
    )
}