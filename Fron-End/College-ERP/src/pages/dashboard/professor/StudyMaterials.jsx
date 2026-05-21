import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  Option,
} from "@material-tailwind/react";
import { getStudentMaterials, uploadStudyMaterial } from "../../../API/ApiStore";

export default function StudyMaterials() {
  const [materialType, setMaterialType] = useState("");
  const [form, setForm] = useState({ title: "", course: "", file: null });
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getStudentMaterials();
      setMaterials(data || []);
    } catch (err) {
      setError(err?.toString() || "Unable to load materials");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!form.title || !materialType || !form.course) {
      setError("Please complete all fields before uploading.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      await uploadStudyMaterial({
        title: form.title,
        type: materialType,
        course: form.course,
        fileName: form.file?.name || "",
      });
      setForm({ title: "", course: "", file: null });
      setMaterialType("");
      await fetchMaterials();
      alert("Study material uploaded successfully.");
    } catch (err) {
      setError(err?.toString() || "Failed to upload material");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <Typography variant="h5">Upload Study Materials</Typography>

      <Card className="border shadow-sm">
        <CardHeader floated={false} shadow={false} className="p-6">
          <Typography variant="h6">Upload New Resource</Typography>
        </CardHeader>
        <CardBody className="p-6 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Input
              type="file"
              label="Upload File"
              onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Select
              label="Type"
              value={materialType}
              onChange={(value) => setMaterialType(value)}
            >
              <Option value="">Select Type</Option>
              <Option value="PDF">PDF</Option>
              <Option value="Video">Video</Option>
              <Option value="Notes">Notes</Option>
            </Select>
            <Input
              label="Course"
              value={form.course}
              onChange={(e) => setForm({ ...form, course: e.target.value })}
            />
          </div>
          {error && <Typography color="red">{error}</Typography>}
          <Button disabled={uploading} onClick={handleUpload}>
            {uploading ? "Uploading..." : "Upload Material"}
          </Button>
        </CardBody>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader floated={false} shadow={false} className="p-6">
          <Typography variant="h6">Uploaded Materials</Typography>
        </CardHeader>
        <CardBody className="p-6 space-y-4">
          {loading && <Typography>Loading materials...</Typography>}
          {!loading && materials.length === 0 && (
            <Typography>No study materials published yet.</Typography>
          )}
          {!loading && materials.map((material) => (
            <div key={material.id} className="flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Typography className="font-medium">{material.title}</Typography>
                <Typography variant="small" className="text-gray-500">
                  {material.course} • {material.type}
                </Typography>
              </div>
              <Button size="sm">View</Button>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
