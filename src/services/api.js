const API_BASE = "http://localhost:8000/api";

export async function fetchDataset() {
  const res = await fetch(`${API_BASE}/dataset`);
  if (!res.ok) throw new Error("Failed to fetch dataset");
  return res.json();
}

export async function planRoute() {
  const res = await fetch(`${API_BASE}/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) throw new Error("Failed to compute route plan");
  return res.json();
}

export async function geocodeAddress(address) {
  const res = await fetch(`${API_BASE}/geocode`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address })
  });
  if (!res.ok) throw new Error("Failed to geocode address");
  return res.json();
}

export async function addStopWithGeocoding(customerName, address, codAmount) {
  const res = await fetch(`${API_BASE}/stops/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer_name: customerName,
      address,
      cod_amount: codAmount
    })
  });
  if (!res.ok) throw new Error("Failed to add and geocode stop");
  return res.json();
}

export async function updateStopAddress(stopId, address, codAmount, customerName) {
  const res = await fetch(`${API_BASE}/stops/${stopId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      address,
      cod_amount: codAmount,
      customer_name: customerName
    })
  });
  if (!res.ok) throw new Error("Failed to update stop address");
  return res.json();
}

export async function triggerReplan(triggerType, stopId = null, newPickupData = null, lockedIndex = 0) {
  const body = {
    trigger_type: triggerType,
    stop_id: stopId,
    locked_stop_index: lockedIndex
  };
  if (newPickupData) {
    body.new_pickup_stop = newPickupData.stop;
    body.new_pickup_package = newPickupData.package;
  }
  const res = await fetch(`${API_BASE}/replan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error("Failed to trigger mid-day replan");
  return res.json();
}

export async function approveReplan() {
  const res = await fetch(`${API_BASE}/replan/approve`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to approve replan");
  return res.json();
}

export async function rejectReplan() {
  const res = await fetch(`${API_BASE}/replan/reject`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to reject replan");
  return res.json();
}

export async function fetchBenchmark() {
  const res = await fetch(`${API_BASE}/benchmark`);
  if (!res.ok) throw new Error("Failed to fetch benchmark");
  return res.json();
}

export async function fetchCosts() {
  const res = await fetch(`${API_BASE}/costs`);
  if (!res.ok) throw new Error("Failed to fetch costs");
  return res.json();
}

export async function updateConstraints(constraintConfig) {
  const res = await fetch(`${API_BASE}/config/constraints`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(constraintConfig)
  });
  if (!res.ok) throw new Error("Failed to update constraints");
  return res.json();
}
