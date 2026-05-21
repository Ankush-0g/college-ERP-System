import { Card, Input, Button, Typography, Select, Option } from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiClient } from "@/API/ApiStore";

export function HODSignUp() {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subjects, setSubjects] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepts(true);
        const response = await apiClient.get("/departments/get-dept");
        setDepartments(response.data || []);
      } catch (err) {
        console.error("Error fetching departments:", err);
        setDepartments([]);
      } finally {
        setLoadingDepts(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setImageUrl(file || null);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!imageUrl) {
      setError("Please upload a profile photo.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", imageUrl);
    formData.append("name", name);
    formData.append("department", department);
    formData.append("username", username);
    formData.append("password", password);
    formData.append("email", email);
    formData.append("phone", phone);

    subjects
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((subject) => formData.append("subjects", subject));

    if (!name || !department || !username || !password || !email || !phone) {
      setError("Please complete all required fields before registering.");
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.post("/hods/add-hod", formData);
      console.log(response.data);
      setError("");
      navigate("/auth/hod/sign-in");
    } catch (error) {
      const errMsg = error.response?.data;
      if (error.response && error.response.status === 409) {
        setError(typeof errMsg === "string" ? errMsg : "An HOD with the same Username or Email already exists.");
      } else {
        setError(typeof errMsg === "string" ? errMsg : "Error uploading hod data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="m-8 flex justify-center">
      <Card className="w-full max-w-lg p-6">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">
            HOD Sign Up
          </Typography>
          <Typography
            variant="paragraph"
            color="blue-gray"
            className="text-lg font-normal"
          >
            Enter your details to register.
          </Typography>
        </div>
        <form className="mt-8" onSubmit={handleSignUp}>
          <div className="mb-4 flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={previewUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect fill='%23e2e8f0' width='96' height='96' rx='24'/%3E%3Ctext x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='16' fill='%236b7280'%3EUpload%3C/text%3E%3C/svg%3E"}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border"
              />
              <input
                type="file"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="Upload profile photo"
                accept="image/*"
                required
              />
            </div>
            <Typography variant="small" color="blue-gray">
              Upload your Profile Photo
            </Typography>
            <Input
              size="lg"
              placeholder="Name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="w-full">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Select Department *
              </label>
              <Select
                value={department}
                onChange={(value) => setDepartment(value)}
                disabled={loadingDepts}
                label="Choose a department"
              >
                <Option value="">Select a Department</Option>
                {departments.map((dept) => (
                  <Option key={dept.id} value={dept.name}>
                    {dept.name} {dept.description ? `- ${dept.description}` : ""}
                  </Option>
                ))}
              </Select>
            </div>
            <Input
              size="lg"
              placeholder="Username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              size="lg"
              placeholder="Email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              size="lg"
              placeholder="Phone"
              name="phone"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              size="lg"
              placeholder="Subjects (comma-separated)"
              name="subjects"
              autoComplete="off"
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
            />
            <Input
              size="lg"
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button
            className={`mt-6 ${loading ? "bg-green-500" : "bg-blue-500"}`}
            fullWidth
            type="submit"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </Button>
          {error && (
            <Typography
              variant="small"
              color="red"
              className="mt-4 text-center"
            >
              {error}
            </Typography>
          )}
          <div className="flex items-center justify-between gap-2 mt-6">
            <Typography variant="small" className="font-medium text-gray-900">
              <a href="#">Forgot Password</a>
            </Typography>
          </div>
          <Typography
            variant="paragraph"
            className="text-center text-blue-gray-500 font-medium mt-4"
          >
            Already have an account?
            <Link to="/auth/hod/sign-in" className="text-gray-900 ml-1">
              Sign In
            </Link>
          </Typography>
        </form>
      </Card>
    </section>
  );
}

export default HODSignUp;
