// ডেমো কনফিগারেশন: এখানে নিজের নাম, প্যাকেজ ও পেমেন্ট তথ্য পরিবর্তন করুন।
const CONFIG = {
  siteName: "Income money trusted BD",
  packages: [
    {name:"স্টার্টার প্যাকেজ", price:299, description:"শুরু করার জন্য", features:["বেসিক অ্যাকাউন্ট","টাস্ক গাইড","অর্ডার হিস্টোরি"]},
    {name:"স্ট্যান্ডার্ড প্যাকেজ", price:599, description:"জনপ্রিয় প্যাকেজ", features:["স্টার্টার প্যাকেজের সব সুবিধা","অগ্রাধিকার সাপোর্ট","অতিরিক্ত রিসোর্স"], featured:true},
    {name:"প্রিমিয়াম প্যাকেজ", price:999, description:"উন্নত সুবিধা", features:["স্ট্যান্ডার্ডের সব সুবিধা","প্রিমিয়াম রিসোর্স","বিশেষ সাপোর্ট"]}
  ],
  payments: {
    bkash:"আপনার বিকাশ নম্বর বসান", nagad:"আপনার নগদ নম্বর বসান",
    rocket:"আপনার রকেট নম্বর বসান", bank:"ব্যাংকের নাম ও অ্যাকাউন্ট নম্বর বসান",
    binance:"আপনার Binance Pay ID বসান", crypto:"কয়েন, নেটওয়ার্ক ও পাবলিক ওয়ালেট ঠিকানা"
  }
};
const ADMIN_PASSWORD = "ChangeMe123!"; // ডেমো পাসওয়ার্ড: লাইভ সাইটে এই পদ্ধতি ব্যবহার করবেন না।
const savedConfig = JSON.parse(localStorage.getItem("siteConfig") || "null");
if (savedConfig) {
  CONFIG.siteName = savedConfig.siteName || CONFIG.siteName;
  CONFIG.packages = savedConfig.packages || CONFIG.packages;
  CONFIG.payments = savedConfig.payments || CONFIG.payments;
}
function saveConfig(){ localStorage.setItem("siteConfig", JSON.stringify(CONFIG)); }

const $ = id => document.getElementById(id);
const money = n => "৳" + Number(n || 0).toLocaleString("bn-BD",{minimumFractionDigits:2,maximumFractionDigits:2});
const getUsers = () => JSON.parse(localStorage.getItem("demoUsers") || "[]");
const getOrders = () => JSON.parse(localStorage.getItem("demoOrders") || "[]");
let currentUser = localStorage.getItem("demoCurrentUser") || "";
let authMode = "register";
let pendingAction = null;

$("siteName").textContent = CONFIG.siteName;
$("footerName").textContent = CONFIG.siteName + " · Owner: Ms Mehedi";
Object.entries(CONFIG.payments).forEach(([key,value]) => { document.querySelector(`[data-pay="${key}"]`).textContent = value; });

function renderPackages(){
  $("packageList").innerHTML = CONFIG.packages.map((p,i)=>`
    <article class="package-card ${p.featured?"featured":""}">
      ${p.featured?'<span class="pill">জনপ্রিয়</span>':''}
      <h3>${p.name}</h3><p class="muted">${p.description}</p>
      <div class="price">${money(p.price)} <small>/ একবার</small></div>
      <ul>${p.features.map(f=>`<li>${f}</li>`).join("")}</ul>
      <button class="btn btn-primary order-btn" data-index="${i}">এখনই অর্ডার করুন</button>
    </article>`).join("");
  document.querySelectorAll(".order-btn").forEach(btn=>btn.addEventListener("click",()=>placeOrder(Number(btn.dataset.index))));
}
function renderDashboard(){
  const orders=getOrders().filter(o=>o.email===currentUser);
  const user=getUsers().find(u=>u.email===currentUser);
  $("userStatus").textContent=user?user.name:"লগইন করা নেই";
  $("welcomeText").textContent=user?`স্বাগতম, ${user.name}! এটি ডেমো অ্যাকাউন্ট; বাস্তব পেমেন্ট চালু নয়。`:"লগইন করলে আপনার অর্ডার ও ডেমো ব্যালেন্স এখানে দেখাবে।";
  $("balance").textContent=money(0); $("heroBalance").textContent=money(0);
  $("orderCount").textContent=orders.length.toLocaleString("bn-BD");
  $("loginOpen").classList.toggle("hidden",!!user); $("registerOpen").classList.toggle("hidden",!!user);
  $("logoutBtn").classList.toggle("hidden",!user);
}
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2800)}
function openAuth(mode){authMode=mode;$("authTitle").textContent=mode==="register"?"রেজিস্ট্রেশন":"লগইন";$("authName").classList.toggle("hidden",mode==="login");$("authName").parentElement.classList.toggle("hidden",mode==="login");$("authSubmit").textContent=mode==="register"?"অ্যাকাউন্ট তৈরি করুন":"লগইন করুন";$("authSwitch").textContent=mode==="register"?"আগে অ্যাকাউন্ট আছে? লগইন":"নতুন অ্যাকাউন্ট? রেজিস্ট্রেশন";$("authError").textContent="";$("authDialog").showModal()}
$("loginOpen").onclick=()=>openAuth("login"); $("registerOpen").onclick=()=>openAuth("register");
$("authSwitch").onclick=()=>openAuth(authMode==="register"?"login":"register");
$("authForm").addEventListener("submit",e=>{
  e.preventDefault();const email=$("authEmail").value.trim().toLowerCase(), password=$("authPassword").value, users=getUsers();
  if(authMode==="register"){
    if(users.some(u=>u.email===email)){$("authError").textContent="এই ইমেইল দিয়ে অ্যাকাউন্ট আছে।";return}
    users.push({name:$("authName").value.trim()||"ব্যবহারকারী",email,password});localStorage.setItem("demoUsers",JSON.stringify(users));
  }else if(!users.some(u=>u.email===email&&u.password===password)){$("authError").textContent="ইমেইল বা পাসওয়ার্ড সঠিক নয়।";return}
  currentUser=email;localStorage.setItem("demoCurrentUser",email);$("authDialog").close();$("authForm").reset();renderDashboard();toast(authMode==="register"?"অ্যাকাউন্ট তৈরি হয়েছে (ডেমো)":"লগইন সফল (ডেমো)");
});
$("logoutBtn").onclick=()=>{currentUser="";localStorage.removeItem("demoCurrentUser");renderDashboard();toast("লগআউট হয়েছে")};
function placeOrder(index){
  if(!currentUser){openAuth("login");toast("অর্ডার করতে আগে লগইন করুন");return}
  const p=CONFIG.packages[index];const orders=getOrders();orders.push({email:currentUser,package:p.name,price:p.price,date:new Date().toISOString(),status:"ডেমো — পেমেন্ট যাচাই হয়নি"});
  localStorage.setItem("demoOrders",JSON.stringify(orders));renderDashboard();toast(`${p.name} অর্ডার ডেমো হিসেবে সংরক্ষিত হয়েছে`);
}
document.querySelectorAll(".task-btn").forEach(btn=>btn.onclick=()=>{ $("actionTitle").textContent=btn.dataset.task; $("actionText").textContent="এই ফিচারটি ডেমো অবস্থায় আছে। বাস্তবে চালু করতে বৈধ স্পনসর/ক্লায়েন্ট, কাজ যাচাই এবং প্রকাশিত পারিশ্রমিকের শর্ত প্রয়োজন। কোনো কাজ সম্পন্ন না করে আয় দাবি করা যাবে না।"; $("actionLabel").classList.add("hidden"); pendingAction="task"; $("actionConfirm").textContent="বুঝেছি"; $("actionDialog").showModal();});
$("withdrawOpen").onclick=()=>{if(!currentUser){openAuth("login");return} $("actionTitle").textContent="উইথড্র অনুরোধ";$("actionText").textContent="ডেমো সংস্করণে বাস্তব ব্যালেন্স বা টাকা তোলার সুবিধা নেই। লাইভ সিস্টেমে KYC, ন্যূনতম উত্তোলন, ফি ও পেমেন্ট যাচাই যুক্ত করতে হবে।";$("actionLabel").classList.add("hidden");$("actionConfirm").textContent="ঠিক আছে";$("actionDialog").showModal()};
$("ordersOpen").onclick=()=>{if(!currentUser){openAuth("login");return}const orders=getOrders().filter(o=>o.email===currentUser);$("actionTitle").textContent="অর্ডার হিস্টোরি";$("actionText").textContent=orders.length?orders.map(o=>`${o.package} — ${money(o.price)} — ${o.status}`).join("\\n"):"এখনো কোনো অর্ডার নেই।";$("actionLabel").classList.add("hidden");$("actionConfirm").textContent="বন্ধ করুন";$("actionDialog").showModal()};
$("actionConfirm").onclick=()=>{pendingAction=null};

let adminActive = false;
function renderAdmin(){
  $("editSiteName").value = CONFIG.siteName;
  $("adminPackages").innerHTML = CONFIG.packages.map((p,i)=>`<div class="admin-row"><span>${p.name} — ${money(p.price)}</span><button class="btn btn-light" data-remove-package="${i}">মুছুন</button></div>`).join("");
  $("adminPackages").querySelectorAll("[data-remove-package]").forEach(b=>b.onclick=()=>{
    CONFIG.packages.splice(Number(b.dataset.removePackage),1);saveConfig();renderPackages();renderAdmin();
  });
  const orders=getOrders();
  $("adminOrders").innerHTML = orders.length ? orders.slice().reverse().map(o=>`<div class="admin-row"><span>${o.package} · ${o.email} · ${money(o.price)}<small>${o.status}</small></span></div>`).join("") : "<p>এখনো কোনো অর্ডার নেই।</p>";
  ["bkash","nagad","rocket","bank","binance","crypto"].forEach(k=>$("pay"+k[0].toUpperCase()+k.slice(1)).value=CONFIG.payments[k]);
}
$("adminLoginBtn").onclick=()=>{
  if($("adminPassword").value!==ADMIN_PASSWORD){toast("অ্যাডমিন পাসওয়ার্ড সঠিক নয়");return}
  adminActive=true;$("adminLogin").classList.add("hidden");$("adminContent").classList.remove("hidden");renderAdmin();toast("ডেমো অ্যাডমিন প্যানেলে প্রবেশ করেছেন");
};
$("adminLogout").onclick=()=>{adminActive=false;$("adminContent").classList.add("hidden");$("adminLogin").classList.remove("hidden");$("adminPassword").value=""};
$("saveSiteName").onclick=()=>{
  const name=$("editSiteName").value.trim();if(!name)return;
  CONFIG.siteName=name;saveConfig();$("siteName").textContent=name;$("footerName").textContent=name+" · Owner: Ms Mehedi";toast("ওয়েবসাইটের নাম সংরক্ষিত হয়েছে");
};
$("addPackage").onclick=()=>{
  const name=$("newPackageName").value.trim(), price=Number($("newPackagePrice").value);
  if(!name||!Number.isFinite(price)||price<0){toast("প্যাকেজের নাম ও সঠিক দাম দিন");return}
  CONFIG.packages.push({name,price,description:"নতুন প্যাকেজ",features:["প্যাকেজের সুবিধা অ্যাডমিন থেকে নির্ধারণ করুন"]});
  saveConfig();$("newPackageName").value="";$("newPackagePrice").value="";renderPackages();renderAdmin();toast("প্যাকেজ যোগ হয়েছে");
};
$("savePayments").onclick=()=>{
  ["bkash","nagad","rocket","bank","binance","crypto"].forEach(k=>CONFIG.payments[k]=$("pay"+k[0].toUpperCase()+k.slice(1)).value.trim());
  saveConfig();Object.entries(CONFIG.payments).forEach(([k,v])=>{const el=document.querySelector(`[data-pay="${k}"]`);if(el)el.textContent=v||"তথ্য যোগ করা হয়নি"});
  toast("পেমেন্ট তথ্য সংরক্ষিত হয়েছে");
};

renderPackages();renderDashboard();
