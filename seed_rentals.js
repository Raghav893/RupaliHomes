const API_URL = "http://localhost:8080/admin/properties";

const mockProperties = [
  {
    title: "Luxury Penthouse Suite",
    description: "Experience the pinnacle of luxury living in this stunning penthouse suite. Featuring panoramic city views, high-end appliances, and a private rooftop terrace.",
    location: "Downtown Metropolis",
    type: "RENT",
    rentAmount: 125000,
    bedrooms: 3,
    bathrooms: 3.5,
    areaSqFt: 2500,
    status: "AVAILABLE",
    imageUrl: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&q=80&w=1000",
    amenities: "Swimming Pool, Gym, Concierge, Parking, Smart Home"
  },
  {
    title: "Cozy Studio Apartment",
    description: "Perfect for young professionals, this fully furnished studio offers modern amenities in a highly desirable neighborhood close to tech parks.",
    location: "Tech Park Avenue",
    type: "RENT",
    rentAmount: 35000,
    bedrooms: 1,
    bathrooms: 1,
    areaSqFt: 600,
    status: "AVAILABLE",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1000",
    amenities: "Furnished, Maintenance included, Security"
  },
  {
    title: "Spacious Family Villa",
    description: "A beautiful 4-bedroom villa with a private garden, perfect for families. Located in a tranquil, secure gated community with excellent schools nearby.",
    location: "Serene Hills Vihar",
    type: "RENT",
    rentAmount: 85000,
    bedrooms: 4,
    bathrooms: 4,
    areaSqFt: 3200,
    status: "AVAILABLE",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000",
    amenities: "Park, Playground, Clubhouse, 24/7 Security"
  },
  {
    title: "Modern Loft with River View",
    description: "Contemporary loft space featuring exposed brick, high ceilings, and stunning views of the river. Perfect for artists or creatives.",
    location: "Riverside District",
    type: "RENT",
    rentAmount: 55000,
    bedrooms: 2,
    bathrooms: 2,
    areaSqFt: 1400,
    status: "AVAILABLE",
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1000",
    amenities: "Balcony, Pet Friendly, Gym"
  }
];

async function seedData() {
  console.log("Authenticating...");
  let token = "";
  try {
    const authRes = await fetch("http://localhost:8080/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@rupali.com", password: "admin123" })
    });
    if (authRes.ok) {
      const data = await authRes.json();
      token = data.token;
      console.log("✅ Authenticated!");
    } else {
      console.error("❌ Failed to authenticate:", await authRes.text());
      return;
    }
  } catch (e) {
    console.error("❌ Auth Error:", e.message);
    return;
  }

  console.log("Seeding rental properties...");
  for (const property of mockProperties) {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(property)
      });
      if (res.ok) {
        console.log(`✅ Successfully added: ${property.title}`);
      } else {
        const text = await res.text();
        console.error(`❌ Failed to add: ${property.title}. Status: ${res.status}. Error: ${text}`);
      }
    } catch (e) {
      console.error(`❌ Error adding ${property.title}:`, e.message);
    }
  }
  console.log("Seeding complete.");
}

seedData();
