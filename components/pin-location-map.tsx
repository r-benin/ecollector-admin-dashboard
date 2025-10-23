'use client'

import { DashboardContext } from '@/app/dashboard/layout';
import { APIProvider, Map, MapProps, Marker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { GeoPoint } from 'firebase/firestore';
import React, { SetStateAction, useContext, useEffect, useState } from 'react';
import PlaceSearch from './place-search';

interface PinLocationMapProps {
    pinLocation: GeoPoint | null
    setPinLocation: React.Dispatch<SetStateAction<GeoPoint | null>>
    setAddress: React.Dispatch<SetStateAction<string>>
}

export default function PinLocationMap({ pinLocation, setPinLocation, children, setAddress, ...props } : React.HTMLAttributes<HTMLDivElement> & PinLocationMapProps) {
    const apiKey = `${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    const GeocodeAPIKey = `${process.env.NEXT_PUBLIC_GOOGLE_GEOCODING_API_KEY}`

    const [centered, setCentered] = useState<boolean>(false)

    async function fetchGeocode(lat: number, lng: number) {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GeocodeAPIKey}`
        
        try {
            const response = await fetch(url)
            const data = await response.json()
            setAddress(`${data.results[0].formatted_address}`)
        } catch (error) {
            console.log('ERROR: ', error)
        }
    }

    return (
        <div {...props} className='flex'>
           <APIProvider apiKey={apiKey}>
            <div className='w-full h-[300px] relative flex mb-12'>
                <PlaceSearch setPinLocation={setPinLocation} setCentered={setCentered} setAddress={setAddress}/>
                <Map
                    className='w-full h-full absolute mt-13' 
                    defaultCenter={pinLocation ? {lat: pinLocation.latitude, lng: pinLocation.longitude} : {lat: 14.6790702516576, lng: 120.98309663310421}}
                    center={centered && pinLocation ? {lat: pinLocation.latitude, lng: pinLocation.longitude} : null}
                    defaultZoom={pinLocation ? 16 : 12}
                    zoom={centered ? 16 : null}
                    gestureHandling='greedy'
                    disableDefaultUI
                    onClick={(event) => {
                        if (event.detail.latLng) {
                            const coordinates = {
                                latitude: event.detail.latLng?.lat,
                                longitude: event.detail.latLng?.lng
                            }
                            fetchGeocode(coordinates.latitude, coordinates.longitude)
                            setPinLocation(new GeoPoint(coordinates.latitude, coordinates.longitude))
                        }
                        setCentered(true)
                    }}
                    onCameraChanged={() => setCentered(false)}
                >
                    { pinLocation ? <Marker position={{lat: pinLocation.latitude, lng: pinLocation.longitude}} /> : null}
                </Map>
            </div>
            </APIProvider> 
        </div>
    )
}
