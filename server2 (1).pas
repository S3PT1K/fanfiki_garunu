program FanficServer;

uses
  System.Net, 
  System.Text, 
  System.IO,
  System.Collections.Generic;

var
  server: HttpListener;
  // Файлы базы данных
  FanficsFile: string = 'fanfics.txt';
  UsersFile: string = 'users.txt';

// ========== СТРУКТУРЫ ДАННЫХ ==========

type
  Fanfic = record
    id: integer;
    title: string;
    author: string;
    content: string;
    size: string;         // Размер (Drabble, etc.)
    categories: string;   // Категории
    features: string;     // Особенности
    rating: string;       // Рейтинг
    status: string;       // Статус
    created_at: string;
  end;
  
  User = record
    nickname: string;
    password: string;
    registered_at: string;
  end;

var
  fanfics: List<Fanfic>;
  users: List<User>;
  nextId: integer;

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

function IsStopChar(ch: char): boolean;
begin
  // Запятую убрали из стоп-символов, чтобы можно было сохранять списки категорий через запятую
  Result := (ch = '"') or (ch = '}');
end;

function SafeStrToInt(s: string): integer;
var
  code: integer;
begin
  Val(s, Result, code);
  if code <> 0 then
    Result := 0;
end;

function ExtractJsonValue(line: string; key: string): string;
var
  searchKey1, searchKey2: string;
  pos1, pos2: integer;
begin
  if line = nil then begin Result := ''; Exit; end;
  
  searchKey1 := '"' + key + '":"';
  searchKey2 := '"' + key + '":';
  
  pos1 := Pos(searchKey1, line);
  if pos1 = 0 then
    pos1 := Pos(searchKey2, line);
  
  if pos1 = 0 then
  begin
    Result := '';
    Exit;
  end;
  
  if Pos(searchKey1, line) > 0 then
    pos1 := pos1 + Length(searchKey1)
  else
    pos1 := pos1 + Length(searchKey2);
  
  pos2 := pos1;
  while (pos2 <= Length(line)) and (not IsStopChar(line[pos2])) do
    pos2 := pos2 + 1;
  
  Result := Copy(line, pos1, pos2 - pos1);
end;

function EscapeJson(s: string): string;
begin
  if s = nil then begin Result := ''; Exit; end;
  Result := s.Replace('\', '\\').Replace('"', '\"').Replace(#10, '\n').Replace(#13, '\r');
end;

// ========== РАБОТА С ФАЙЛАМИ ==========

procedure LoadFanfics();
var
  FileContent: string;
  lines: array of string;
  i: integer;
  f: Fanfic;
begin
  fanfics := new List<Fanfic>;
  nextId := 1;
  
  if not FileExists(FanficsFile) then Exit;
  
  FileContent := System.IO.File.ReadAllText(FanficsFile, Encoding.UTF8);
  lines := FileContent.Split(#10);
  
  i := 0;
  while i < Length(lines) do
  begin
    var currentLine := lines[i].Trim().Replace(#13, '');
    if currentLine = 'FANFIC_START' then
    begin
      // Читаем поля с проверкой границ массива (защита от ошибки индекса)
      if i + 1 < Length(lines) then f.id := SafeStrToInt(ExtractJsonValue(lines[i+1], 'id'));
      if i + 2 < Length(lines) then f.title := ExtractJsonValue(lines[i+2], 'title');
      if i + 3 < Length(lines) then f.author := ExtractJsonValue(lines[i+3], 'author');
      if i + 4 < Length(lines) then f.size := ExtractJsonValue(lines[i+4], 'size');
      if i + 5 < Length(lines) then f.categories := ExtractJsonValue(lines[i+5], 'categories');
      if i + 6 < Length(lines) then f.features := ExtractJsonValue(lines[i+6], 'features');
      if i + 7 < Length(lines) then f.rating := ExtractJsonValue(lines[i+7], 'rating');
      if i + 8 < Length(lines) then f.status := ExtractJsonValue(lines[i+8], 'status');
      if i + 9 < Length(lines) then f.content := ExtractJsonValue(lines[i+9], 'content');
      if i + 10 < Length(lines) then f.created_at := ExtractJsonValue(lines[i+10], 'created_at');
      
      fanfics.Add(f);
      if f.id >= nextId then nextId := f.id + 1;
      i := i + 11; 
    end
    else
      i := i + 1;
  end;
end;

procedure SaveFanfics();
var
  sb: StringBuilder;
begin
  sb := new StringBuilder;
  foreach var f in fanfics do
  begin
    sb.AppendLine('FANFIC_START');
    sb.AppendLine('  {"id":' + IntToStr(f.id) + '}');
    sb.AppendLine('  {"title":"' + EscapeJson(f.title) + '"}');
    sb.AppendLine('  {"author":"' + EscapeJson(f.author) + '"}');
    sb.AppendLine('  {"size":"' + EscapeJson(f.size) + '"}');
    sb.AppendLine('  {"categories":"' + EscapeJson(f.categories) + '"}');
    sb.AppendLine('  {"features":"' + EscapeJson(f.features) + '"}');
    sb.AppendLine('  {"rating":"' + EscapeJson(f.rating) + '"}');
    sb.AppendLine('  {"status":"' + EscapeJson(f.status) + '"}');
    sb.AppendLine('  {"content":"' + EscapeJson(f.content) + '"}');
    sb.AppendLine('  {"created_at":"' + f.created_at + '"}');
    sb.AppendLine('FANFIC_END');
    sb.AppendLine('');
  end;
  System.IO.File.WriteAllText(FanficsFile, sb.ToString, Encoding.UTF8);
end;

procedure LoadUsers();
var
  FileContent: string;
  lines: array of string;
  i: integer;
  u: User;
begin
  users := new List<User>;
  if not FileExists(UsersFile) then Exit;
  
  FileContent := System.IO.File.ReadAllText(UsersFile, Encoding.UTF8);
  lines := FileContent.Split(#10);
  
  i := 0;
  while i < Length(lines) do
  begin
    var currentLine := lines[i].Trim().Replace(#13, '');
    if currentLine = 'USER_START' then
    begin
      if i + 1 < Length(lines) then u.nickname := ExtractJsonValue(lines[i+1], 'nickname');
      if i + 2 < Length(lines) then u.password := ExtractJsonValue(lines[i+2], 'password');
      if i + 3 < Length(lines) then u.registered_at := ExtractJsonValue(lines[i+3], 'registered_at');
      users.Add(u);
      i := i + 4;
    end
    else
      i := i + 1;
  end;
end;

procedure SaveUsers();
var
  sb: StringBuilder;
begin
  sb := new StringBuilder;
  foreach var u in users do
  begin
    sb.AppendLine('USER_START');
    sb.AppendLine('  {"nickname":"' + EscapeJson(u.nickname) + '"}');
    sb.AppendLine('  {"password":"' + EscapeJson(u.password) + '"}');
    sb.AppendLine('  {"registered_at":"' + u.registered_at + '"}');
    sb.AppendLine('USER_END');
    sb.AppendLine('');
  end;
  System.IO.File.WriteAllText(UsersFile, sb.ToString, Encoding.UTF8);
end;

// ========== ОБРАБОТЧИКИ ЗАПРОСОВ ==========

procedure SendJsonResponse(context: HttpListenerContext; json: string; statusCode: integer := 200);
begin
  var bytes := Encoding.UTF8.GetBytes(json);
  context.Response.ContentType := 'application/json; charset=utf-8';
  context.Response.StatusCode := statusCode;
  context.Response.OutputStream.Write(bytes, 0, bytes.Length);
end;

procedure HandleGetFanfics(context: HttpListenerContext);
var
  sb: StringBuilder;
  first: boolean;
begin
  sb := new StringBuilder;
  sb.Append('[');
  first := true;
  
  foreach var f in fanfics do
  begin
    if not first then sb.Append(',');
    first := false;
    
    sb.Append('{');
    sb.Append('"id":' + IntToStr(f.id) + ',');
    sb.Append('"title":"' + EscapeJson(f.title) + '",');
    sb.Append('"author":"' + EscapeJson(f.author) + '",');
    sb.Append('"size":"' + EscapeJson(f.size) + '",');
    sb.Append('"categories":"' + EscapeJson(f.categories) + '",');
    sb.Append('"features":"' + EscapeJson(f.features) + '",');
    sb.Append('"rating":"' + EscapeJson(f.rating) + '",');
    sb.Append('"status":"' + EscapeJson(f.status) + '",');
    sb.Append('"content":"' + EscapeJson(f.content) + '",');
    sb.Append('"created_at":"' + f.created_at + '"');
    sb.Append('}');
  end;
  
  sb.Append(']');
  SendJsonResponse(context, sb.ToString, 200);
end;

procedure HandleCreateFanfic(context: HttpListenerContext);
var
  RequestBody: string;
  f: Fanfic;
begin
  var reader := new System.IO.StreamReader(context.Request.InputStream, Encoding.UTF8);
  RequestBody := reader.ReadToEnd();
  
  f.id := nextId;
  nextId := nextId + 1;
  f.title := ExtractJsonValue(RequestBody, 'title');
  f.author := ExtractJsonValue(RequestBody, 'author');
  f.size := ExtractJsonValue(RequestBody, 'size');
  f.categories := ExtractJsonValue(RequestBody, 'categories');
  f.features := ExtractJsonValue(RequestBody, 'features');
  f.rating := ExtractJsonValue(RequestBody, 'rating');
  f.status := ExtractJsonValue(RequestBody, 'status');
  f.content := ExtractJsonValue(RequestBody, 'content');
  f.created_at := DateTime.Now.ToString('yyyy-MM-dd HH:mm:ss');
  
  if f.title = '' then f.title := 'Без названия';
  
  fanfics.Add(f);
  SaveFanfics();
  
  SendJsonResponse(context, '{"status":"success","id":' + IntToStr(f.id) + '}', 201);
end;

procedure HandleLogin(context: HttpListenerContext);
var
  RequestBody: string;
  nickname, password: string;
  found: boolean;
begin
  var reader := new System.IO.StreamReader(context.Request.InputStream, Encoding.UTF8);
  RequestBody := reader.ReadToEnd();
  
  nickname := ExtractJsonValue(RequestBody, 'nickname');
  password := ExtractJsonValue(RequestBody, 'password');
  
  found := false;
  foreach var u in users do
    if (u.nickname = nickname) and (u.password = password) then found := true;
  
  if found then
    SendJsonResponse(context, '{"status":"success","nickname":"' + nickname + '"}', 200)
  else
    SendJsonResponse(context, '{"status":"error","message":"Неверный логин или пароль"}', 401);
end;

procedure HandleRegister(context: HttpListenerContext);
var
    RequestBody: string;
    u: User;
    exists: boolean;
begin
    var reader := new System.IO.StreamReader(context.Request.InputStream, Encoding.UTF8);
    RequestBody := reader.ReadToEnd();
    u.nickname := ExtractJsonValue(RequestBody, 'nickname');
    u.password := ExtractJsonValue(RequestBody, 'password');
    u.registered_at := DateTime.Now.ToString('yyyy-MM-dd HH:mm:ss');

    exists := false;
    foreach var existingUser in users do
        if existingUser.nickname = u.nickname then
        begin
            exists := true;
            break;
        end;

    if exists then
    begin
        SendJsonResponse(context,
            '{"status":"error","message":"Пользователь с таким никнеймом уже существует"}',
            409);
        Exit;
    end;
    // ─────────────────────────────────────────────────

    users.Add(u);
    SaveUsers();
    SendJsonResponse(context, '{"status":"success"}', 201);
end;

// ========== ОСНОВНАЯ ПРОГРАММА ==========

begin
  LoadUsers();
  LoadFanfics();
  
  server := new HttpListener();
  server.Prefixes.Add('http://localhost:8080/');
  server.Start();
  
  writeln('========================================');
  writeln('📖 Сервер запущен на http://localhost:8080/');
  writeln('📂 Фанфиков загружено: ', fanfics.Count);
  writeln('👥 Пользователей загружено: ', users.Count);
  writeln('========================================');
  
  while true do
  begin
    var context := server.GetContext();
    
    // CORS настройки для браузеров
    context.Response.AddHeader('Access-Control-Allow-Origin', '*');
    context.Response.AddHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    context.Response.AddHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if context.Request.HttpMethod = 'OPTIONS' then
    begin
      context.Response.StatusCode := 200;
      context.Response.Close();
      continue;
    end;
    
    var url := context.Request.Url.LocalPath;
    var method := context.Request.HttpMethod;
    
    if (method = 'GET') and (url = '/api/fanfics') then
      HandleGetFanfics(context)
    else if (method = 'POST') and (url = '/api/fanfics') then
      HandleCreateFanfic(context)
    else if (method = 'POST') and (url = '/api/login') then
      HandleLogin(context)
    else if (method = 'POST') and (url = '/api/register') then
      HandleRegister(context)
    else
    begin
      context.Response.StatusCode := 404;
    end;
    
    context.Response.Close();
  end;
end.