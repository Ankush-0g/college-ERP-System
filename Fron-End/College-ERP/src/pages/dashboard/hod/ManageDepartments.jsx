import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardBody,
  CardHeader,
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  Input,
} from "@material-tailwind/react";
import { getDepartments, createDepartment } from "@/API/ApiStore";

export default function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", description: "" });

  const fetchDepartments = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getDepartments();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async () => {
    try {
      await createDepartment(form);
      setOpen(false);
      setForm({ name: "", code: "", description: "" });
      fetchDepartments();
    } catch (err) {
      setError(err?.message || JSON.stringify(err));
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <Typography variant="h5">Manage Departments</Typography>
        <Button color="blue" size="sm" onClick={() => setOpen(true)}>
          New Department
        </Button>
      </div>

      <Card>
        <CardHeader shadow={false} floated={false} className="p-4">
          <Typography variant="small" className="text-gray-600">
            Departments list
          </Typography>
        </CardHeader>
        <CardBody className="p-4">
          {loading ? (
            <Typography>Loading...</Typography>
          ) : error ? (
            <Typography color="red">{error}</Typography>
          ) : departments.length === 0 ? (
            <Typography>No departments found.</Typography>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] table-auto">
                <thead>
                  <tr>
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Code</th>
                    <th className="text-left py-2">Description</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((d) => (
                    <tr key={d.id || d.code} className="border-t">
                      <td className="py-2">{d.name}</td>
                      <td className="py-2">{d.code}</td>
                      <td className="py-2">{d.description}</td>
                      <td className="py-2">-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Dialog open={open} handler={() => setOpen(!open)} size="sm">
        <DialogBody>
          <Typography variant="h6" className="mb-2">
            New Department
          </Typography>
          <div className="flex flex-col gap-3">
            <Input
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
            <Input
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button color="blue" onClick={handleCreate}>
            Create
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

