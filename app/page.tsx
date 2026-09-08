import SquareSyncButton from './components/SquareSyncButton';

export default function Home() {
  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">GOLAZO Gym Management System</h1>
        <SquareSyncButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-md border border-gray-100">
          <h2 className="text-lg font-semibold mb-2">売上概要</h2>
          <p className="text-gray-600 text-sm">
            Squareから取得した売上・決済データがここに表示されます。
          </p>
        </div>
      </div>
    </main>
  );
}
