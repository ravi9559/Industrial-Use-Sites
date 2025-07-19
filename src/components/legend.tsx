
import { Ship, Plane, Building2, Warehouse } from 'lucide-react';

const LegendItem = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-3 text-sm">{children}</div>
);

const LineIndicator = ({ color }: { color: string }) => (
  <div className="w-5 h-1" style={{ backgroundColor: color }}></div>
);

const IconIndicator = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center justify-center w-5 h-5">{children}</div>
)

export function Legend() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        <div className="space-y-3">
            <LegendItem>
                <IconIndicator><Ship className="h-4 w-4 text-blue-500" /></IconIndicator>
                <span>Port</span>
            </LegendItem>
            <LegendItem>
                <IconIndicator><Warehouse className="h-4 w-4 text-blue-500" /></IconIndicator>
                <span>Dry Port</span>
            </LegendItem>
            <LegendItem>
                <IconIndicator><Plane className="h-4 w-4 text-teal-500" /></IconIndicator>
                <span>Airport</span>
            </LegendItem>
            <LegendItem>
                <IconIndicator><div className="p-1 bg-indigo-500 rounded-full"><Building2 className="h-3 w-3 text-white" /></div></IconIndicator>
                <span>SIDCO Park</span>
            </LegendItem>
            <LegendItem>
                <IconIndicator><div className="p-1 bg-purple-500 rounded-full"><Building2 className="h-3 w-3 text-white" /></div></IconIndicator>
                <span>SIPCOT Park</span>
            </LegendItem>
             <LegendItem>
                <IconIndicator><div className="h-5 w-5 bg-white text-blue-700 rounded-full shadow-md flex items-center justify-center text-[8px] font-bold border border-blue-200">2XX</div></IconIndicator>
                <span>Available Land</span>
            </LegendItem>
        </div>
        <div className="space-y-3">
             <LegendItem>
                <LineIndicator color="hsl(208 98% 73%)" />
                <span>Outer Ring Road</span>
            </LegendItem>
            <LegendItem>
                <LineIndicator color="hsl(244 98% 73%)" />
                <span>Peripheral Ring Road</span>
            </LegendItem>
             <LegendItem>
                <LineIndicator color="#FFA500" />
                <span>Chithoor Expressway</span>
            </LegendItem>
            <LegendItem>
                <LineIndicator color="#228B22" />
                <span>STRR</span>
            </LegendItem>
            <LegendItem>
                <LineIndicator color="#FF00FF" />
                <span>NE7 Expressway</span>
            </LegendItem>
            <LegendItem>
                <LineIndicator color="#808080" />
                <span>100km Trunk Road</span>
            </LegendItem>
        </div>
      </div>
  );
}
