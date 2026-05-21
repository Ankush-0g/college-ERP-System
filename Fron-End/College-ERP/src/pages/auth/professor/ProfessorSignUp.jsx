import { Card, Input, Button, Typography, Select, Option } from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { apiClient } from "@/API/ApiStore";


export function ProfessorSignUp() {
  const [imageUrl, setImageUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [professorId, setProfessorId] = useState("");
  const [name, setName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [subject, setSubject] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subjects, setSubjects] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    const file = e.target.files[0];
    setImageUrl(file);
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

    if (!professorId || !name || !departmentName || !subject || !username || !password || !email || !phone) {
      setError("Please complete all required fields before registering.");
      setLoading(false);
      return;
    }


    const formData = new FormData();
    formData.append("file", imageUrl);
    formData.append("professorId", professorId);
    formData.append("name", name);
    formData.append("departmentName", departmentName);
    formData.append("subject", subject);
    formData.append("username", username);
    formData.append("password", password);
    formData.append("email", email);
    formData.append("phone", phone);

    subjects
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((subjectItem) => formData.append("subjects", subjectItem));

    try {
      const response = await axios.post(
        "http://localhost:8080/api/professors/add-prof",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response.data);
      setError("");
      navigate("/auth/professor/sign-in");
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setError(error.response.data);
      } else {
        setError("Error uploading Professor data. Please try again.");
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
            Professor Sign Up
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
                src={previewUrl || "/placeholder-image.png"}
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
              placeholder="Professor ID"
              value={professorId}
              onChange={(e) => setProfessorId(e.target.value)}
            />
            <Input
              size="lg"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="w-full">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Select Department *
              </label>
              <Select
                value={departmentName}
                onChange={(value) => setDepartmentName(value)}
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
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <Input
              size="lg"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              size="lg"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              size="lg"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              size="lg"
              placeholder="Subjects (comma-separated)"
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
            />
            <Input
              size="lg"
              type="password"
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
            <Link to="/auth/professor/sign-in" className="text-gray-900 ml-1">
              Sign In
            </Link>
          </Typography>
        </form>
      </Card>
    </section>
  );
}

export default ProfessorSignUp;
