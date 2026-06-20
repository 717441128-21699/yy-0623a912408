import { useEffect } from 'react';
import TopBar from '@/components/TopBar';
import VehicleWall from '@/components/VehicleWall';
import AlertConsole from '@/components/AlertConsole';
import HandoverRecord from '@/components/HandoverRecord';
import { useStore } from '@/store';

export default function Home() {
  const incrementPowerOffMinutes = useStore((s) => s.incrementPowerOffMinutes);
  const updateVehicleTemp = useStore((s) => s.updateVehicleTemp);

  useEffect(() => {
    const t1 = setInterval(() => {
      incrementPowerOffMinutes();
    }, 60000);
    const t2 = setInterval(() => {
      updateVehicleTemp();
    }, 5000);
    return () => {
      clearInterval(t1);
      clearInterval(t2);
    };
  }, [incrementPowerOffMinutes, updateVehicleTemp]);

  return (
    <div className="w-full h-full flex flex-col bg-deep-sea-950 noise-bg scanline-overlay">
      <TopBar />
      <main className="flex-1 flex overflow-hidden p-4 gap-4 relative z-10">
        <section className="flex-1 min-w-0 overflow-hidden">
          <VehicleWall />
        </section>
        <section className="flex-1 min-w-0 overflow-hidden">
          <AlertConsole />
        </section>
        <section className="flex-[0.9] min-w-0 overflow-hidden">
          <HandoverRecord />
        </section>
      </main>
    </div>
  );
}
