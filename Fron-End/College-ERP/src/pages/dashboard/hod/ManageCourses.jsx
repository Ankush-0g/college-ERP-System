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
import { getCourses, createCourse, getSubjects, mapSubjectsToCourse, createSubjectAndMapToCourse, deleteCourse, deleteSubject } from "@/API/ApiStore";


export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openMap, setOpenMap] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [form, setForm] = useState({ name: "", code: "", description: "", credits: 0 });
  const [addSubjectForm, setAddSubjectForm] = useState({
    code: "",
    name: "",
    credits: 0,
    grade: "A",
    ct1: 0,
    ct2: 0,
    theory: 0,
    semesterId: null,
  });
  const [error, setError] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [cData, sData] = await Promise.all([getCourses(), getSubjects()]);
      setCourses(Array.isArray(cData) ? cData : []);
      setSubjects(Array.isArray(sData) ? sData : []);
    } catch (err) {
      setError(err?.message || JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCreate = async () => {
    try {
      await createCourse(form);
      setOpenCreate(false);
      setForm({ name: "", code: "", description: "" });
      fetchAll();
    } catch (err) {
      setError(err?.message || JSON.stringify(err));
    }
  };

  const openMapDialog = (course) => {
    setSelectedCourse(course);
    const existing = subjects
      .filter((subject) => subject.course?.id === course.id)
      .map((subject) => subject.id);
    setSelectedSubjectIds(existing);
    setOpenMap(true);
  };

  const toggleSubject = (id) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleMapSave = async () => {
    if (!selectedCourse) return;
    try {
      await mapSubjectsToCourse(selectedCourse.id || selectedCourse.courseId, selectedSubjectIds);
      setOpenMap(false);
      setSelectedCourse(null);
      fetchAll();
    } catch (err) {
      setError(err?.message || JSON.stringify(err));
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Delete this course? All subject mappings will be removed.")) {
      return;
    }

    try {
      await deleteCourse(courseId);
      setSelectedCourse(null);
      setSelectedSubjectIds([]);
      fetchAll();
    } catch (err) {
      setError(err?.message || JSON.stringify(err));
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!window.confirm("Delete this subject? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteSubject(subjectId);
      setSelectedSubjectIds((prev) => prev.filter((id) => id !== subjectId));
      fetchAll();
    } catch (err) {
      setError(err?.message || JSON.stringify(err));
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <Typography variant="h5">Manage Courses & Subjects</Typography>
        <div className="flex gap-2">
          <Button size="sm" color="green" onClick={() => setOpenCreate(true)}>
            New Course
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader shadow={false} floated={false} className="p-4">
          <Typography variant="small" className="text-gray-600">
            Courses
          </Typography>
        </CardHeader>
        <CardBody className="p-4">
          {loading ? (
            <Typography>Loading...</Typography>
          ) : error ? (
            <Typography color="red">{error}</Typography>
          ) : courses.length === 0 ? (
            <Typography>No courses found.</Typography>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] table-auto">
                <thead>
                  <tr>
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Code</th>
                    <th className="text-left py-2">Description</th>
                    <th className="text-left py-2">Subjects</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c.id || c.code} className="border-t">
                      <td className="py-2">{c.name}</td>
                      <td className="py-2">{c.code}</td>
                      <td className="py-2">{c.description}</td>
                      <td className="py-2">
                        {subjects.filter((subject) => subject.course?.id === c.id).length}
                      </td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => openMapDialog(c)}>
                            Map Subjects
                          </Button>
                          <Button size="sm" color="red" onClick={() => handleDeleteCourse(c.id)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Create Course Dialog */}
      <Dialog open={openCreate} handler={() => setOpenCreate(!openCreate)} size="sm">
        <DialogBody>
          <Typography variant="h6" className="mb-2">
            New Course
          </Typography>
          <div className="flex flex-col gap-3">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            <Input
              label="Credits"
              type="number"
              value={form.credits}
              onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })}
            />
            <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button color="blue" onClick={handleCreate}>Create</Button>
        </DialogFooter>
      </Dialog>

      {/* Map Subjects Dialog */}
      <Dialog open={openMap} handler={() => setOpenMap(!openMap)} size="lg">
        <DialogBody>
          <Typography variant="h6" className="mb-2">
            Map Subjects to {selectedCourse?.name}
          </Typography>

          {/* Create New Subject */}
          <div className="p-3 mb-4 border rounded">
            <Typography variant="small" className="text-gray-700 mb-2">
              Add new subject and map to this course
            </Typography>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Code"
                value={addSubjectForm.code}
                onChange={(e) => setAddSubjectForm((p) => ({ ...p, code: e.target.value }))}
              />
              <Input
                label="Name"
                value={addSubjectForm.name}
                onChange={(e) => setAddSubjectForm((p) => ({ ...p, name: e.target.value }))}
              />
              <Input
                label="Credits"
                type="number"
                value={addSubjectForm.credits}
                onChange={(e) => setAddSubjectForm((p) => ({ ...p, credits: Number(e.target.value) }))}
              />
              <Input
                label="Grade"
                value={addSubjectForm.grade}
                onChange={(e) => setAddSubjectForm((p) => ({ ...p, grade: e.target.value }))}
              />
              <Input
                label="CT1"
                type="number"
                value={addSubjectForm.ct1}
                onChange={(e) => setAddSubjectForm((p) => ({ ...p, ct1: Number(e.target.value) }))}
              />
              <Input
                label="CT2"
                type="number"
                value={addSubjectForm.ct2}
                onChange={(e) => setAddSubjectForm((p) => ({ ...p, ct2: Number(e.target.value) }))}
              />
              <Input
                label="Theory"
                type="number"
                value={addSubjectForm.theory}
                onChange={(e) => setAddSubjectForm((p) => ({ ...p, theory: Number(e.target.value) }))}
              />

              {/* Semester is optional; omit it when the input is left blank. */}
              <Input
                label="Semester ID"
                type="number"
                value={addSubjectForm.semesterId ?? ""}
                onChange={(e) => setAddSubjectForm((p) => ({ ...p, semesterId: e.target.value === "" ? null : Number(e.target.value) }))}
              />
            </div>

            <div className="mt-3 flex gap-2">
              <Button
                color="blue"
                size="sm"
                onClick={async () => {
                  try {
                    if (!selectedCourse) return;
                    // backend expects: SubjectDTO
                    const payload = {
                      code: addSubjectForm.code,
                      name: addSubjectForm.name,
                      credits: addSubjectForm.credits,
                      grade: addSubjectForm.grade || "A",
                      ct1: addSubjectForm.ct1,
                      ct2: addSubjectForm.ct2,
                      theory: addSubjectForm.theory,
                    };
                    if (addSubjectForm.semesterId) {
                      payload.semester = { id: addSubjectForm.semesterId };
                    }


                    await createSubjectAndMapToCourse({
                      courseId: selectedCourse.id || selectedCourse.courseId,
                      payload,
                    });

                    // reset + refresh
                    setAddSubjectForm({ code: "", name: "", credits: 0, grade: "A", ct1: 0, ct2: 0, theory: 0, semesterId: null });
                    fetchAll();
                    // also update selected ids list
                    setSelectedSubjectIds([]);
                  } catch (err) {
                    setError(err?.message || JSON.stringify(err));
                  }
                }}
              >
                Add & Map Subject
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {subjects.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-2 p-2 border rounded">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={selectedSubjectIds.includes(s.id)} onChange={() => toggleSubject(s.id)} />
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-sm text-gray-500">{s.code}</div>
                  </div>
                </label>
                <Button size="sm" color="red" onClick={() => handleDeleteSubject(s.id)}>
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={() => setOpenMap(false)}>Cancel</Button>
          <Button color="blue" onClick={handleMapSave}>Save</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
