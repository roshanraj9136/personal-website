import DocumentView from '@/components/ui/DocumentView'
import HyperSite from '@/components/ui/HyperSite'

export default function Home() {
  return (
    <>
      <a className="skip" href="#document">
        Skip the 4D scene and read the text
      </a>
      <HyperSite />
      {/* Always rendered, never injected: see the note in DocumentView. */}
      <DocumentView />
    </>
  )
}
