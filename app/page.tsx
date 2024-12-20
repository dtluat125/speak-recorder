import Header from '@/components/ui/Header';
import Banner from '@/components/pages/home/Banner';
import DeviceSection from '@/components/pages/home/DeviceSection';
import { redirect } from 'next/navigation';

const HomePage = () => {
  return redirect('/dashboard');
  return (
    <div>
      <Header />
      <Banner />
      <DeviceSection />
    </div>
  );
};

export default HomePage;
