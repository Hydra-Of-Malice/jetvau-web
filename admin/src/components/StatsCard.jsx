export default function StatsCard({ title, value, icon: Icon, color = 'blue' }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        orange: 'bg-orange-50 text-orange-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        red: 'bg-red-50 text-red-600',
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-500">{title}</h3>
                <div className={`p-2 rounded-lg ${colors[color]}`}>
                    <Icon size={20} />
                </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
    );
}
