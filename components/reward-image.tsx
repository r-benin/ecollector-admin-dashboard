import { storage } from "@/app/firebase/config"
import { getDownloadURL, ref } from "firebase/storage"
import Image from "next/image"
import { useState } from "react"

interface RewardImageProps {
    icon: string,
    alt: string,
}

export default function RewardImage({ icon, alt } : RewardImageProps) {
    const [iconURL, setIconURL] = useState<string>('')

    const getIcon = getDownloadURL(ref(storage, `/ecollector_assets/rewards/${icon}`))
        .then((url) => setIconURL(url))

    if (iconURL !== '') {
        return (
            <Image src={iconURL} alt={alt} width={50} height={50} className='mx-3' />
        )
    }
}