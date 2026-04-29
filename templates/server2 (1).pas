program FanficServer;

uses
  System.Net, 
  System.Text, 
  System.IO,
  System.Collections.Generic;

var
  server: HttpListener;
  DataFile: string = 'database.txt';

// ========== СТРУКТУРЫ ДАННЫХ ==========

type
  Fanfic = record
    id: integer;
    title: string;
    author: string;
    content: string;
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
  Result := (ch = '"') or (ch = ',') or (ch = '}');
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
  searchKey1: string;
  searchKey2: string;
  pos1: integer;
  pos2: integer;
begin
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
var
  i: integer;
begin
  Result := '';
  i := 1;
  while i <= Length(s) do
  begin
    if s[i] = '"' then
      Result := Result + '\"'
    else if s[i] = '\' then
      Result := Result + '\\'
    else if s[i] = #10 then
      Result := Result + '\n'
    else if s[i] = #13 then
      Result := Result + '\r'
    else
      Result := Result + s[i];
    i := i + 1;
  end;
end;

// ========== РАБОТА С ФАЙЛОВОЙ БАЗОЙ ДАННЫХ ==========

procedure LoadData();
var
  FileContent: string;
  lines: array of string;
  i: integer;
  f: Fanfic;
  u: User;
begin
  fanfics := new List<Fanfic>;
  users := new List<User>;
  nextId := 1;
  
  if not FileExists(DataFile) then
    Exit;
  
  FileContent := System.IO.File.ReadAllText(DataFile, Encoding.UTF8);
  lines := FileContent.Split(#10);
  
  i := 0;
  while i < Length(lines) do
  begin
    if Pos('FANFIC_START', lines[i]) > 0 then
    begin
      i := i + 1;
      if i < Length(lines) then
        f.id := SafeStrToInt(ExtractJsonValue(lines[i], 'id'));
      i := i + 1;
      if i < Length(lines) then
        f.title := ExtractJsonValue(lines[i], 'title');
      i := i + 1;
      if i < Length(lines) then
        f.author := ExtractJsonValue(lines[i], 'author');
      i := i + 1;
      if i < Length(lines) then
        f.content := ExtractJsonValue(lines[i], 'content');
      i := i + 1;
      if i < Length(lines) then
        f.created_at := ExtractJsonValue(lines[i], 'created_at');
      
      fanfics.Add(f);
      if f.id >= nextId then
        nextId := f.id + 1;
    end;
    
    if Pos('USER_START', lines[i]) > 0 then
    begin
      i := i + 1;
      if i < Length(lines) then
        u.nickname := ExtractJsonValue(lines[i], 'nickname');
      i := i + 1;
      if i < Length(lines) then
        u.password := ExtractJsonValue(lines[i], 'password');
      i := i + 1;
      if i < Length(lines) then
        u.registered_at := ExtractJsonValue(lines[i], 'registered_at');
      
      users.Add(u);
    end;
    
    i := i + 1;
  end;
  
  writeln('📂 Загружено фанфиков: ', fanfics.Count);
  writeln('📂 Загружено пользователей: ', users.Count);
end;

procedure SaveData();
var
  sb: StringBuilder;
  f: Fanfic;
  u: User;
  idx: integer;
begin
  sb := new StringBuilder;
  sb.AppendLine('// Файл базы данных фанфиков');
  sb.AppendLine('// Дата: ' + DateTime.Now.ToString('yyyy-MM-dd HH:mm:ss'));
  sb.AppendLine('');
  
  idx := 0;
  while idx < fanfics.Count do
  begin
    f := fanfics[idx];
    sb.AppendLine('FANFIC_START');
    sb.AppendLine('  {"id":' + IntToStr(f.id) + '}');
    sb.AppendLine('  {"title":"' + EscapeJson(f.title) + '"}');
    sb.AppendLine('  {"author":"' + EscapeJson(f.author) + '"}');
    sb.AppendLine('  {"content":"' + EscapeJson(f.content) + '"}');
    sb.AppendLine('  {"created_at":"' + f.created_at + '"}');
    sb.AppendLine('FANFIC_END');
    sb.AppendLine('');
    idx := idx + 1;
  end;
  
  idx := 0;
  while idx < users.Count do
  begin
    u := users[idx];
    sb.AppendLine('USER_START');
    sb.AppendLine('  {"nickname":"' + EscapeJson(u.nickname) + '"}');
    sb.AppendLine('  {"password":"' + EscapeJson(u.password) + '"}');
    sb.AppendLine('  {"registered_at":"' + u.registered_at + '"}');
    sb.AppendLine('USER_END');
    sb.AppendLine('');
    idx := idx + 1;
  end;
  
  System.IO.File.WriteAllText(DataFile, sb.ToString, Encoding.UTF8);
  writeln('💾 Данные сохранены');
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
  f: Fanfic;
  first: boolean;
  idx: integer;
begin
  sb := new StringBuilder;
  sb.Append('[');
  first := true;
  
  idx := 0;
  while idx < fanfics.Count do
  begin
    f := fanfics[idx];
    if not first then
      sb.Append(',');
    first := false;
    
    sb.Append('{"id":' + IntToStr(f.id) + ',"title":"' + EscapeJson(f.title) + '","author":"' + EscapeJson(f.author) + '","content":"' + EscapeJson(f.content) + '","created_at":"' + f.created_at + '"}');
    idx := idx + 1;
  end;
  
  sb.Append(']');
  SendJsonResponse(context, sb.ToString, 200);
  writeln('✅ GET /api/fanfics - отдано ', fanfics.Count, ' фанфиков');
end;

procedure HandleCreateFanfic(context: HttpListenerContext);
var
  RequestBody: string;
  title, author, content: string;
  newId: integer;
  newFanfic: Fanfic;
begin
  var reader := new System.IO.StreamReader(context.Request.InputStream, Encoding.UTF8);
  RequestBody := reader.ReadToEnd();
  
  title := ExtractJsonValue(RequestBody, 'title');
  author := ExtractJsonValue(RequestBody, 'author');
  content := ExtractJsonValue(RequestBody, 'content');
  
  if title = '' then title := 'Без названия';
  if author = '' then author := 'Anonymous';
  
  newId := nextId;
  nextId := nextId + 1;
  
  newFanfic.id := newId;
  newFanfic.title := title;
  newFanfic.author := author;
  newFanfic.content := content;
  newFanfic.created_at := DateTime.Now.ToString('yyyy-MM-dd HH:mm:ss');
  
  fanfics.Add(newFanfic);
  SaveData();
  
  var responseJson := '{"status":"success","id":' + IntToStr(newId) + '}';
  SendJsonResponse(context, responseJson, 201);
  writeln('✅ POST /api/fanfics - создан фанфик #', newId, ': ', title);
end;

procedure HandleLogin(context: HttpListenerContext);
var
  RequestBody: string;
  nickname, password: string;
  u: User;
  found: boolean;
  idx: integer;
begin
  var reader := new System.IO.StreamReader(context.Request.InputStream, Encoding.UTF8);
  RequestBody := reader.ReadToEnd();
  
  nickname := ExtractJsonValue(RequestBody, 'nickname');
  password := ExtractJsonValue(RequestBody, 'password');
  
  found := false;
  idx := 0;
  while idx < users.Count do
  begin
    u := users[idx];
    if (u.nickname = nickname) and (u.password = password) then
    begin
      found := true;
      Break;
    end;
    idx := idx + 1;
  end;
  
  if found then
  begin
    SendJsonResponse(context, '{"status":"success","nickname":"' + nickname + '"}', 200);
    writeln('🔐 POST /api/login - ', nickname, ' успешно');
  end
  else
  begin
    SendJsonResponse(context, '{"status":"error","message":"Неверный логин или пароль"}', 401);
    writeln('🔐 POST /api/login - ', nickname, ' неудача');
  end;
end;

procedure HandleRegister(context: HttpListenerContext);
var
  RequestBody: string;
  nickname, password, password2: string;
  newUser: User;
  exists: boolean;
  u: User;
  idx: integer;
begin
  var reader := new System.IO.StreamReader(context.Request.InputStream, Encoding.UTF8);
  RequestBody := reader.ReadToEnd();
  
  nickname := ExtractJsonValue(RequestBody, 'nickname');
  password := ExtractJsonValue(RequestBody, 'password');
  password2 := ExtractJsonValue(RequestBody, 'password2');
  
  if password <> password2 then
  begin
    SendJsonResponse(context, '{"status":"error","message":"Пароли не совпадают"}', 400);
    Exit;
  end;
  
  if Length(password) < 3 then
  begin
    SendJsonResponse(context, '{"status":"error","message":"Пароль должен быть не менее 3 символов"}', 400);
    Exit;
  end;
  
  exists := false;
  idx := 0;
  while idx < users.Count do
  begin
    u := users[idx];
    if u.nickname = nickname then
    begin
      exists := true;
      Break;
    end;
    idx := idx + 1;
  end;
  
  if exists then
  begin
    SendJsonResponse(context, '{"status":"error","message":"Пользователь уже существует"}', 400);
    Exit;
  end;
  
  newUser.nickname := nickname;
  newUser.password := password;
  newUser.registered_at := DateTime.Now.ToString('yyyy-MM-dd HH:mm:ss');
  
  users.Add(newUser);
  SaveData();
  
  SendJsonResponse(context, '{"status":"success","nickname":"' + nickname + '"}', 201);
  writeln('📝 Зарегистрирован новый пользователь: ', nickname);
end;

// ========== ОСНОВНАЯ ПРОГРАММА ==========

begin
  LoadData();
  
  server := new HttpListener();
  server.Prefixes.Add('http://localhost:8080/');
  server.Start();
  
  writeln('========================================');
  writeln('📖 Сервер фанфиков запущен!');
  writeln('🌐 http://localhost:8080/');
  writeln('📡 API: http://localhost:8080/api/fanfics');
  writeln('💾 База данных: ', DataFile);
  writeln('========================================');
  writeln('Нажмите Enter для остановки сервера');
  writeln('');
  
  while true do
  begin
    var context := server.GetContext();
    
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
    
    writeln(DateTime.Now.ToString('HH:mm:ss'), ' ', method, ' ', url);
    
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
      var errorMsg := '<h1>404 - Не найдено</h1><p>' + url + '</p>';
      var bytes := Encoding.UTF8.GetBytes(errorMsg);
      context.Response.OutputStream.Write(bytes, 0, bytes.Length);
      writeln('  ❌ 404: ', url);
    end;
    
    context.Response.Close();
  end;
end.