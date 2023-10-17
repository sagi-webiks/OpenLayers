import { useEffect, useState } from 'react';
import Loc from '../assets/location.svg'
import Mic from '../assets/microphone.svg'
import Target from '../assets/target.svg'

import { v4 as uuidv4 } from 'uuid';
import { Coordinate } from 'ol/coordinate';

export interface IAddMarkerProps {
    addMarker: (marker: MarkerData) => void;
    clickedCoords: Coordinate
}

export interface MarkerData {
    id: string,
    positions: Coordinate,
    image: string,
    poly: { width: number, height: number, angle: number }
}

export interface AddForm {
    id: string,
    positions: [string, string],
    image: string,
    poly: { width: number, height: number, angle: number }
}
// type SetMyState = React.Dispatch<React.SetStateAction<Marker>>;


export function AddMarker({ addMarker, clickedCoords }: IAddMarkerProps) {
    const [markerData, setMarkerData] = useState<AddForm>({
        id: '',
        positions: ['3921223', '3733902'],
        image: Loc,
        poly: { width: 0, height: 0, angle: 0 }
    })

    useEffect(() => {
        if (clickedCoords.length > 0) {
            if (markerData.positions[0] !== clickedCoords[0].toString() || markerData.positions[1] !== clickedCoords[1].toString()) {
                setMarkerData(prev => ({
                    ...prev,
                    positions: [clickedCoords[0].toString(), clickedCoords[1].toString()]
                }))
            }
        }
    }, [clickedCoords, markerData])

    return (
        <form>
            Positions: <br />
            <input type="text" value={markerData.positions[0]} placeholder='Insert Position 1' onChange={e => setMarkerData(prev => ({ ...prev, positions: [(e.target.value), prev.positions[1]] }))} />
            <span style={{ margin: '0.1em' }}>,</span>
            <input type="text" value={markerData.positions[1]} placeholder='Insert Position 2' onChange={e => setMarkerData(prev => ({ ...prev, positions: [prev.positions[0], (e.target.value)] }))} />
            <br /> Icon Select: <br />
            <select onChange={e => setMarkerData(prev => ({ ...prev, image: e.target.value }))} >
                <option value={Loc}>Location</option>
                <option value={Mic}>Mic</option>
                <option value={Target}>Target</option>

            </select>
            <hr />
            Area To Mark: <br />
            <input type="text" placeholder='Insert Area Width' onChange={e => setMarkerData(prev => ({ ...prev, poly: { ...prev.poly, width: parseInt(e.target.value) } }))} />
            <input type="text" placeholder='Insert Area Height' onChange={e => setMarkerData(prev => ({ ...prev, poly: { ...prev.poly, height: parseInt(e.target.value) } }))} />
            <input type="number" min={0} max={359} placeholder='Insert Area Angle' onChange={e => setMarkerData(prev => ({ ...prev, poly: { ...prev.poly, angle: parseInt(e.target.value) } }))} />

            <hr />
            <br />
            <input type="submit" value="add" onClick={(e) => {
                e.preventDefault()

                addMarker({
                    ...markerData,
                    id: uuidv4(),
                    positions: [parseInt(markerData.positions[0]), parseInt(markerData.positions[1])]
                })
            }} />
        </form>
    );
}
