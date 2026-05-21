import React, { useState } from "react";
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
import { requestCertificate } from "../../../API/ApiStore";

export default function CertificateRequest() {
  const [form, setForm] = useState({ type: "graduation", purpose: "" });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await requestCertificate(1, {
        certificateType: form.type,
        purpose: form.purpose,
      });
      setStatus({ success: true, message: response?.message || "Certificate request submitted." });
    } catch (error) {
      setStatus({ success: false, message: error?.message || "Failed to submit request." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <Typography variant="h5">Certificate Request</Typography>
      <Card className="border shadow-sm">
        <CardHeader floated={false} shadow={false} className="p-6">
          <Typography variant="h6">Request a Certificate</Typography>
        </CardHeader>
        <CardBody className="p-6 space-y-4">
          <Select
            label="Certificate Type"
            value={form.type}
            onChange={(value) => setForm({ ...form, type: value })}
          >
            <Option value="graduation">Graduation Certificate</Option>
            <Option value="character">Character Certificate</Option>
            <Option value="bonafide">Bonafide Certificate</Option>
          </Select>
          <Input
            label="Purpose"
            value={form.purpose}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
          />
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
          {status && (
            <Typography className={status.success ? "text-green-600" : "text-red-600"}>
              {status.message}
            </Typography>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
