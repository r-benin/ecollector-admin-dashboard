import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps"
import { SetStateAction, useEffect, useRef, useState } from "react"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { GeoPoint } from "firebase/firestore"

interface PlaceSearchProps {
    setPinLocation: React.Dispatch<SetStateAction<GeoPoint | null>>
    setCentered: React.Dispatch<SetStateAction<boolean>>
    setAddress: React.Dispatch<SetStateAction<string>>
}

export default function PlaceSearch({ setPinLocation, setCentered, setAddress } : PlaceSearchProps) {
    const inputRef = useRef<HTMLInputElement>(null!)

    const [placesService, setPlacesService] = useState<google.maps.places.PlacesService>()
    const [autocompleteToken, setAutocompleteToken] = useState<google.maps.places.AutocompleteSessionToken>()
    const [autocomplete, setAutocomplete] = useState<(google.maps.places.Place | undefined)[]>()
    const [inputText, setInputText] = useState<string>('')

    const map = useMap()
    const placesLibrary = useMapsLibrary('places')

    useEffect(() => {
        if (map && placesLibrary) {
            setPlacesService(new placesLibrary.PlacesService(map))
        }
    }, [map, placesLibrary])

    useEffect(() => {
        if (placesService) {
            setAutocompleteToken(new google.maps.places.AutocompleteSessionToken())
        }
        
    }, [placesService])

    async function onPlaceInput(text: string) {
        setInputText(text)
        if (autocompleteToken && text) {
            const request = {
                input: text,
                origin: { lat: 14.6790702516576, lng: 120.98309663310421 },
                language: "en-US",
                region: "ph",
                sessionToken: autocompleteToken
        }
            const suggestions = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request)
            const autocompleteSuggestions: (google.maps.places.Place | undefined)[] = await Promise.all(
            suggestions.suggestions.map((suggestion) => {
                if (suggestion.placePrediction) {
                    return suggestion.placePrediction.toPlace().fetchFields({fields: ['displayName', 'formattedAddress', 'location']}) 
                        .then((place) => place.place)
                }
            }))
            setAutocomplete(autocompleteSuggestions)
        }
    }
    
    function onPlaceSelect(place: google.maps.places.Place) {
        place.displayName && setInputText(place.displayName)
        const placeCoordinates = place.location && {latitude: place.location.lat(), longitude: place.location.lng()}
        placeCoordinates && setPinLocation(new GeoPoint(placeCoordinates.latitude, placeCoordinates.longitude))
        setAutocomplete([])
        setCentered(true)
        place.formattedAddress && setAddress(place.formattedAddress)
    }

    return (
        <div className='w-full'>
            <Command className="border-1 h-auto absolute z-10">
                <CommandInput
                    onValueChange={onPlaceInput}
                    value={inputText}
                    placeholder="Enter name of place"
                />
                { inputText ?
                    <CommandList className="">
                        <CommandGroup>
                        { 
                            autocomplete && autocomplete[0] ? autocomplete.map((place) => {
                                return (
                                    place &&
                                    <CommandItem 
                                        key={place.id}
                                        onSelect={() => onPlaceSelect(place)}
                                    >{place.displayName}
                                    </CommandItem>
                                )
                            }) : null
                        }
                        </CommandGroup>
                    </CommandList>
                : null
                }
            </Command>
        </div>
    )
}