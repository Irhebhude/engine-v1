import { SearchProvider } from './lib/searchContext'
import { MediaGrid } from './components/MediaGrid'
function App() {
  return (
    <SearchProvider>
      <MediaGrid />
    </SearchProvider>
  )
}
export default App
