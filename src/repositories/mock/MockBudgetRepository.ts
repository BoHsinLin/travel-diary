export type Expense={id:string;title:string;meta:string;amount:string;split:string};
const expenses:Expense[]=[{id:'expense-001',title:'Mangrove Sinseol',meta:'住宿 · 安琪代付',amount:'₩ 320,000',split:'你需付 ₩106,667'},{id:'expense-002',title:'廣藏市場晚餐',meta:'餐飲 · 林柏代付',amount:'₩ 68,000',split:'平均分 3 人'},{id:'expense-003',title:'Naver Taxi',meta:'交通 · 你代付',amount:'₩ 18,200',split:'待 2 人付款'}];
export const budgetRepository={async listExpenses(){return structuredClone(expenses)}};
