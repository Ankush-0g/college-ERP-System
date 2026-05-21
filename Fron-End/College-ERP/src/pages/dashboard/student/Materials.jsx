import React, { useEffect, useState } from "react";
import { Typography, Card, CardBody, Button } from "@material-tailwind/react";
import { getStudentMaterials } from "../../../API/ApiStore";

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
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
      setError(err?.toString() || "Unable to load study materials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <Typography variant="h5">Download Study Materials</Typography>
      {loading && <Typography>Loading study materials...</Typography>}
      {error && <Typography color="red">{error}</Typography>}
      <div className="grid gap-6 lg:grid-cols-2">
        {materials.map((material) => (
          <Card key={material.id} className="border shadow-sm">
            <CardBody>
              <Typography className="font-medium">{material.title}</Typography>
              <Typography variant="small" className="text-gray-500">
                {material.type} • Uploaded {material.uploadedAt ? material.uploadedAt : "Unknown"}
              </Typography>
              <Button size="sm" className="mt-4" onClick={() => alert(`Downloading ${material.title}`)}>
                Download
              </Button>
            </CardBody>
          </Card>
        ))}
        {!loading && materials.length === 0 && (
          <Typography>No study materials are available yet.</Typography>
        )}
      </div>
    </div>
  );
}
