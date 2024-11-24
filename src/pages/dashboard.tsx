import Cookies from 'js-cookie';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import ProfileCard from '~/components/dashboard/ProfileCard';

export default function Dashboard () {
    const [user, setUser] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
  
    const router = useRouter();
  
    useEffect(() => {
      const temp_token = Cookies.get('token');
      const temp_user = Cookies.get('user');
  
      if (!temp_token || !temp_user) {
        void router.push('/');
        return;
      }
  
      setToken(temp_token);

      try {
        const parsedUser = JSON.parse(temp_user) as string | null;
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user JSON:', error);
        setUser(null);
      }
    }, [router]);
  return (
    <>
        <Head>
            <title>Expenso - Dashboard</title>
            <meta name="description" content="Generated by create-t3-app" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <main>
            <ProfileCard />
        </main>
    </>
  )
}