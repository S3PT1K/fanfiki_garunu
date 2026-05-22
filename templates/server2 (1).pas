program FanficServer;

uses
  System.Net, 
  System.Text, 
  System.IO,
  System.Collections.Generic;

var
  server: HttpListener;
  FanficsFile: string = 'fanfics.txt';
  UsersFile: string = 'users.txt';

// ========== СТРУКТУРЫ ДАННЫХ ==========

type
  Fanfic = record
    id: integer;
    title: string;
    author: string;
    content: string;
    size: string;
    categories: string;
    features: string;
    rating: string;
    status: string;
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

function SafeStrToInt(s: string): integer;
var
  code: integer;
begin
  Val(s.Trim, Result, code);
  if code <> 0 then
    Result := 0;
end;

// Улучшенная и безопасная функция извлечения значений из JSON
function ExtractJsonValue(line: string; key: string): string;
var
  searchKey: string;
  p, pEnd: integer;
  isString: boolean;
begin
  Result := '';
  if string.IsNullOrEmpty(line) then Exit;
  
  searchKey := '"' + key + '"';
  p := Pos(searchKey, line);
  if p = 0 then Exit;
  
  p := p + Length(searchKey);
  
  // Ищем двоеточие-разделитель поля
  while (p <= line.Length) and (line[p] <> ':') do
    p := p + 1;
  if p > line.Length then Exit;
  p := p + 1; // Пропускаем ':'
  
  // Пропускаем пробелы и знаки переноса до начала значения
  while (p <= line.Length) and (line[p] in [' ', #9, #10, #13]) do
    p := p + 1;
    
  if p > line.Length then Exit;
  
  // Определяем, текстовое это поле (в кавычках) или числовое
  if line[p] = '"' then
  begin
    isString := true;
    p := p + 1; // Сдвигаемся за открывающую кавычку
  end
  else
    isString := false;
    
  pEnd := p;
  if isString then
  begin
    // Читаем до закрывающей кавычки, игнорируя экранированные ( \")
    while pEnd <= line.Length do
    begin
      if (line[pEnd] = '"') and (line[pEnd - 1] <> '\') then
        Break;
      pEnd := pEnd + 1;
    end;
  end
  else
  begin
    // Для чисел/логических значений читаем до запятой или конца объекта
    while (pEnd <= line.Length) and (not (line[pEnd] in [',', '}', ' ', #9, #10, #13])) do
      pEnd := pEnd + 1;
  end;
  
  Result := Copy(line, p, pEnd - p);
  
  // Восстанавливаем спецсимволы при чтении из JSON строки обратно в текст
  if isString then
    Result := Result.Replace('\"', '"').Replace('\n', #10).Replace('\r', #13).Replace('\\', '\');
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
  lines := FileContent.Split(new char[] (#10, #13), System.StringSplitOptions.RemoveEmptyEntries);
  
  i := 0;
  while i < Length(lines) do
  begin
    // Добавлена проверка на наличие всех 12 полей записи, чтобы избежать падения
    if (lines[i].Trim() = 'FANFIC_START') and (i + 11 < Length(lines)) then
    begin
      f.id         := SafeStrToInt(ExtractJsonValue(lines[i+1],  'id'));
      f.title       := ExtractJsonValue(lines[i+2],  'title');
      f.author      := ExtractJsonValue(lines[i+3],  'author');
      f.size        := ExtractJsonValue(lines[i+4],  'size');
      f.categories  := ExtractJsonValue(lines[i+5],  'categories');
      f.features    := ExtractJsonValue(lines[i+6],  'features');
      f.rating      := ExtractJsonValue(lines[i+7],  'rating');
      f.status      := ExtractJsonValue(lines[i+8],  'status');
      f.content     := ExtractJsonValue(lines[i+9],  'content');
      f.created_at  := ExtractJsonValue(lines[i+10], 'created_at');
      
      fanfics.Add(f);
      if f.id >= nextId then nextId := f.id + 1;
      i := i + 12; // Переход за FANFIC_END
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
    sb.AppendLine('  {"id":' + f.id.ToString() + '}');
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
  lines := FileContent.Split(new char[] (#10, #13), System.StringSplitOptions.RemoveEmptyEntries);
  
  i := 0;
  while i < Length(lines) do
  begin
    if (lines[i].Trim() = 'USER_START') and (i + 4 < Length(lines)) then
    begin
      u.nickname      := ExtractJsonValue(lines[i+1], 'nickname');
      u.password      := ExtractJsonValue(lines[i+2], 'password');
      u.registered_at := ExtractJsonValue(lines[i+3], 'registered_at');
      users.Add(u);
      i := i + 5; // Переход за USER_END
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
  try
    var bytes := Encoding.UTF8.GetBytes(json);
    context.Response.ContentType := 'application/json; charset=utf-8';
    context.Response.StatusCode := statusCode;
    context.Response.ContentLength64 := bytes.Length; // Обязательно передаем размер, чтобы не вешать клиентские запросы
    context.Response.OutputStream.Write(bytes, 0, bytes.Length);
  except
  end;
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
    sb.Append('"id":'           + f.id.ToString()            + ',');
    sb.Append('"title":"'       + EscapeJson(f.title)         + '",');
    sb.Append('"author":"'      + EscapeJson(f.author)        + '",');
    sb.Append('"size":"'        + EscapeJson(f.size)          + '",');
    sb.Append('"categories":"'  + EscapeJson(f.categories)    + '",');
    sb.Append('"features":"'    + EscapeJson(f.features)      + '",');
    sb.Append('"rating":"'      + EscapeJson(f.rating)        + '",');
    sb.Append('"status":"'      + EscapeJson(f.status)        + '",');
    sb.Append('"content":"'     + EscapeJson(f.content)       + '",');
    sb.Append('"created_at":"'  + f.created_at                + '"');
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
  
  f.id         := nextId;
  nextId       := nextId + 1;
  f.title      := ExtractJsonValue(RequestBody, 'title');
  f.author     := ExtractJsonValue(RequestBody, 'author');
  f.size       := ExtractJsonValue(RequestBody, 'size');
  f.categories := ExtractJsonValue(RequestBody, 'categories');
  f.features   := ExtractJsonValue(RequestBody, 'features');
  f.rating     := ExtractJsonValue(RequestBody, 'rating');
  f.status     := ExtractJsonValue(RequestBody, 'status');
  f.content    := ExtractJsonValue(RequestBody, 'content');
  f.created_at := DateTime.Now.ToString('yyyy-MM-dd HH:mm:ss');
  
  if string.IsNullOrWhiteSpace(f.title) then f.title := 'Без названия';
  
  fanfics.Add(f);
  SaveFanfics();
  
  SendJsonResponse(context, '{"status":"success","id":' + f.id.ToString() + '}', 201);
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
  
  if (nickname = '') or (password = '') then
  begin
    SendJsonResponse(context, '{"status":"error","message":"Поля не могут быть пустыми"}', 400);
    Exit;
  end;
  
  found := false;
  foreach var u in users do
    if (u.nickname = nickname) and (u.password = password) then
    begin
      found := true;
      Break;
    end;
  
  if found then
    SendJsonResponse(context, '{"status":"success","nickname":"' + EscapeJson(nickname) + '"}', 200)
  else
    SendJsonResponse(context, '{"status":"error","message":"Неверный ник или пароль"}', 401);
end;

procedure HandleRegister(context: HttpListenerContext);
var
  RequestBody: string;
  u: User;
begin
  var reader := new System.IO.StreamReader(context.Request.InputStream, Encoding.UTF8);
  RequestBody := reader.ReadToEnd();
  
  u.nickname      := ExtractJsonValue(RequestBody, 'nickname');
  u.password      := ExtractJsonValue(RequestBody, 'password');
  u.registered_at := DateTime.Now.ToString('yyyy-MM-dd HH:mm:ss');
  
  if (u.nickname = '') or (u.password = '') then
  begin
    SendJsonResponse(context, '{"status":"error","message":"Заполните все поля"}', 400);
    Exit;
  end;
  
  foreach var existing in users do
    if existing.nickname.ToLower() = u.nickname.ToLower() then
    begin
      SendJsonResponse(context, '{"status":"error","message":"Ник уже занят"}', 409);
      Exit;
    end;
  
  users.Add(u);
  SaveUsers();
  
  SendJsonResponse(context, '{"status":"success","nickname":"' + EscapeJson(u.nickname) + '"}', 201);
end;

// ========== ОСНОВНАЯ ПРОГРАММА ==========

begin
  LoadUsers();
  LoadFanfics();
  
  server := new HttpListener();
  server.Prefixes.Add('http://localhost:8080/');
  
  try
    server.Start();
  except
    on E: Exception do
    begin
      writeln('ОШИБКА: Не удалось запустить сервер. Запустите программу от имени администратора.');
      writeln(E.Message);
      exit;
    end;
  end;
  
  writeln('========================================');
  writeln('📖 Сервер запущен на http://localhost:8080/');
  writeln('📂 Фанфиков загружено: ', fanfics.Count);
  writeln('👥 Пользователей загружено: ', users.Count);
  writeln('========================================');
  
  while true do
  begin
    var context := server.GetContext();
    
    // Настройки CORS
    context.Response.AddHeader('Access-Control-Allow-Origin', '*');
    context.Response.AddHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    context.Response.AddHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if context.Request.HttpMethod = 'OPTIONS' then
    begin
      context.Response.StatusCode := 200;
      context.Response.Close();
      continue;
    end;
    
    try
      var url    := context.Request.Url.LocalPath;
      var method := context.Request.HttpMethod;
      
      if      (method = 'GET')  and (url = '/api/fanfics')  then HandleGetFanfics(context)
      else if (method = 'POST') and (url = '/api/fanfics')  then HandleCreateFanfic(context)
      else if (method = 'POST') and (url = '/api/login')    then HandleLogin(context)
      else if (method = 'POST') and (url = '/api/register') then HandleRegister(context)
      else
        context.Response.StatusCode := 404;
    except
      on E: Exception do
      begin
        writeln('Ошибка запроса: ', E.Message);
        context.Response.StatusCode := 500;
      end;
    end;
    
    context.Response.Close();
  end;
end.