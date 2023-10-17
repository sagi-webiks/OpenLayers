import { useState } from 'react'
import './App.css'

import OpenLayerMap from './components/OLMap'
import { AddMarker, MarkerData } from './components/AddMarker'
import { Coordinate } from 'ol/coordinate'



function App() {
  const [markers, setMarkers] = useState<MarkerData[]>([])
  const [clickedCoords, setClickedCoords] = useState<Coordinate>([])

  const addMarker = (marker: MarkerData) => {
    setMarkers(prev => ([...prev, marker]))
  }
  return (
    <div style={{ display: 'flex', gap: '5em' }}>
      <OpenLayerMap
        center={[3921223, 3733902]}
        zoom={10}
        markers={markers}
        setCoords={(coords: Coordinate) =>
          setClickedCoords(coords)
        }
      />
      <div>
        <h1>Add Marker</h1>
        <AddMarker addMarker={(marker: MarkerData) => addMarker(marker)} clickedCoords={clickedCoords} />
      </div>
    </div>
  )
}

export default App
