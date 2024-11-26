import { cookies } from 'next/headers';
import { UserInfo } from './start-meeting/_components/types';
import './styles.css';

interface Props {
  children: React.ReactNode
}


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const c = cookies().toString();

  const userinfoRequest = await fetch('http://localhost:3000/api/userinfo', {
    headers: { Cookie: cookies().toString() },
  });
  const userinfo : UserInfo = await userinfoRequest.json();


  return (
    <html lang="en">
      <body className="flex-row">
        <div className="navbar bg-base-100">
          <div className="flex-1">
            <a className="btn btn-ghost text-xl">No Meeting Overtime</a>
          </div>
          <div className="flex-none">
            {userinfo.authenticated && 
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <img
                    alt="Tailwind CSS Navbar component"
                    src={userinfo.picture} />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                <li><a>Logout</a></li>
              </ul>
            </div>
  }
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
