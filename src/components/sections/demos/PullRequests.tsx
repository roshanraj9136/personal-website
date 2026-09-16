import { FaCodeBranch, FaShieldAlt, FaUserSecret } from 'react-icons/fa'
import { pullRequests } from '@/content/site'

export default function PullRequests() {
  return (
    <div className="demo">
      <div className="demo-head">
        <span>Merged pull requests</span>
        <span className="demo-note">OpenLake/RateMyCourse</span>
      </div>
      <ul className="grid gap-2">
        {pullRequests.map((pr) => (
          <li key={pr.number}>
            <a className="pr-row" href={`https://github.com/OpenLake/RateMyCourse/pull/${pr.number}`} target="_blank" rel="noreferrer">
              <span className="pr-icon" aria-hidden="true">
                {pr.type === 'security' ? <FaShieldAlt /> : <FaUserSecret />}
              </span>
              <span className="flex-1">{pr.title}</span>
              <span className="pr-number">
                <FaCodeBranch aria-hidden="true" /> #{pr.number}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
