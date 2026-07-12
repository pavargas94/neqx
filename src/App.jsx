import Header from './components/Header'
import FormPanel from './components/FormPanel'
import ResultsPanel from './components/ResultsPanel'

export default function App() {
  return (
    <>
      <Header />
      <div className="app-workspace">
        <FormPanel />
        <ResultsPanel />
      </div>
    </>
  )
}
