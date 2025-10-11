'use client'

import { DashboardContext } from '@/app/dashboard/layout';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import React, { useContext } from 'react';

export default function RequestsCollectionMap({ children, ...props } : React.HTMLAttributes<HTMLDivElement>) {
    const apiKey = `${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    
    const { pendingCoordinates, mapLocation, panMapLocation, centered, setCentered } = useContext(DashboardContext)

    return (
        <div {...props}>
           <APIProvider apiKey={apiKey}>
                <Map
                    style={{width: '100%', height: '100%'}}
                    defaultCenter={{lat: mapLocation.latitude, lng: mapLocation.longitude}}
                    center={centered ? {lat: mapLocation.latitude, lng: mapLocation.longitude} : null}
                    defaultZoom={12}
                    zoom={centered ? 16 : null}
                    gestureHandling='greedy'
                    disableDefaultUI
                    onCenterChanged={() => setCentered(false)}
                >
                    { pendingCoordinates ? pendingCoordinates.map((marker, index) => {
                        const lat = marker.latitude
                        const lng = marker.longitude
                        return <Marker key={index} position={{lat: lat, lng: lng}} onClick={() =>{ panMapLocation(marker); setCentered(true)}}/>
                    }): null}
                </Map>
            </APIProvider> 
        </div>
    )
}
