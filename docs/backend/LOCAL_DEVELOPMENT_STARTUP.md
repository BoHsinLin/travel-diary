# 本機 Supabase 啟動與恢復

本文件只適用於 `travel-planner-pwa` 的本機 Supabase。所有命令都應在專案根目錄執行。

## 安全邊界

- 腳本只使用 `--local` 與 Docker context `default`，不得帶入遠端 project ref、access token 或 database URL。
- 預設模式不執行 `db reset`，不刪除 container/volume，不覆寫 `.env.local`，也不輸出 anon、service-role 或其他 keys。
- 本機 database volume 名稱是 `supabase_db_travel-planner-pwa`。Container 停止不代表 volume 或資料遺失。
- `.env.local` 必須由開發者管理；腳本只驗證 `VITE_SUPABASE_URL=http://127.0.0.1:55431`，不寫入或顯示 key。

## 日常開機

```powershell
.\scripts\start-local.ps1
```

預設模式會依序檢查 Docker Engine、Supabase CLI、ports、containers、volume、health 與 `.env.local` URL，然後使用既有 volume 安全啟動 stack。若 volume 不存在，腳本會停止，不會自動建立空資料庫。

只讀檢查，不啟動任何服務：

```powershell
.\scripts\start-local.ps1 -Status
```

停止 stack 並保留資料：

```powershell
supabase stop
```

再次執行預設模式後，既有 volume 會被重用。

## 首次建立

只有已確認本機 volume 不存在，而且確實要建立新的本機環境時才執行：

```powershell
.\scripts\start-local.ps1 -Initialize
```

此模式建立本機 containers/volume，並由 Supabase CLI 套用 `supabase/migrations/` 與 `supabase/seed.sql`。它不會建立或修改遠端 Auth users。

## 異常恢復

依腳本 exit code 與訊息處理：

| Exit | 狀況 | 處理方式 |
|---:|---|---|
| 20 | Docker Desktop／Engine unavailable | 啟動 Docker Desktop，等待 Engine ready，再重跑。 |
| 12 | Supabase CLI unavailable | 安裝 CLI，或用 `-SupabaseExecutable <path>` 指定已安裝版本。 |
| 30 | 55431–55436 的服務 port 被其他程序占用 | 停止占用程序，或同步調整 `config.toml` 與 `.env.local`。 |
| 31 | `.env.local` 缺失或 URL 不一致 | 手動修正 `VITE_SUPABASE_URL`；腳本不會覆寫檔案。 |
| 40 | Database volume 不存在 | 若是首次建立，明確使用 `-Initialize`；若原本應有資料，先停止並調查 Docker volume，不要 reset。 |
| 43 | Volume 存在但 stack 已停止 | 執行預設模式恢復既有 stack；不要 `-Initialize` 或 reset。 |
| 70 | 必要 container missing/unhealthy | 等待後重跑 `-Status`，持續失敗時查看 `docker ps -a` 與 container logs。 |
| 71 | HTTP／DB health 失敗 | 檢查 Auth/API/Studio/Mail endpoint 與 DB logs。 |

若 container 不存在但 volume 仍存在，使用預設模式即可恢復，不需要 reset。

## 明確 Reset

Reset 會清空本機 database 並重播 migrations/seed，只能在確定不需要保留本機資料時使用：

```powershell
.\scripts\start-local.ps1 -Reset
```

腳本會要求再次輸入完全相同的確認文字：

```text
RESET LOCAL DATABASE
```

確認不符時以非零狀態退出，不執行 reset。遠端 database 與 Auth 不在此流程內。

## Ports 與 Health

| Port | 用途 | Healthy 判斷 |
|---:|---|---|
| 55431 | API gateway；Auth 與 Realtime 經此路由 | Auth health、REST endpoint、Kong/Auth/Realtime containers |
| 55432 | PostgreSQL | DB container healthy、`pg_isready` |
| 55433 | Analytics | Analytics container healthy |
| 55434 | Studio | Studio HTTP 200、container healthy |
| 55435 | Shadow DB reserved port | 日常未監聽是正常狀態，只在 diff/shadow 工作時使用 |
| 55436 | Local mail UI | Mail HTTP 200、Inbucket container healthy |

目前 CLI 2.115.0 會警告 `[inbucket]` config section 已棄用，後續可獨立遷移至 `[local_smtp]`。Storage 已停用時，非必要 `vector` container 可能顯示 restarting；腳本會列為 warning，但不把它混同於主要 API/Auth/DB/Realtime/Studio/Mail health。

## 驗證指令

重建後的後端驗收：

```powershell
supabase test db --local
supabase db lint --local --level error --fail-on error
```

Auth seed smoke 需要將 `supabase status -o env` 的本機值映射到下列 process environment variables，再執行 runner：

```text
API_URL -> SUPABASE_URL
ANON_KEY -> SUPABASE_ANON_KEY
SERVICE_ROLE_KEY -> SUPABASE_SERVICE_ROLE_KEY
```

```powershell
node scripts/local-auth-seed-smoke.mjs
```

Runner 不輸出 token 或 keys，只回報 Admin users、password grant 與 JWT `sub` 的斷言結果。
