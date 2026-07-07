<script lang="tsx">
import { Fragment, Teleport, computed, defineComponent, h, ref } from "vue";
import { Search, Plus, Filter, Users, MapPin, Mail, Phone, ArrowLeft, ArrowRight, Check, Trash2, Edit3, Eye, CheckCircle2, X, Building, Briefcase, ChevronDown } from "lucide-vue-next";
import { formatRupiah } from '../data.ts';
import { Proyek, Klien, Pegawai, AnggotaTim } from '../types.ts';
function todayIso() { return new Date().toISOString().slice(0, 10); }

interface CrmViewProps {
  proyek: Proyek[];
  klien: Klien[];
  pegawai: Pegawai[];
  onAddProyek: (newP: Proyek) => Promise<any> | any;
  onUpdateProyek: (updatedP: Proyek) => Promise<any> | any;
  onAddKlien: (newK: Klien) => Promise<any> | any;
  onUpdateKlien: (updatedK: Klien) => void;
  onDeleteProyek: (id: string) => void;
  onDeleteKlien: (id: string) => void;
  showToast: (msg: string) => void;
}
export default defineComponent({
  name: "CrmView",
  props: ["proyek", "klien", "pegawai", "onAddProyek", "onUpdateProyek", "onAddKlien", "onUpdateKlien", "onDeleteProyek", "onDeleteKlien", "showToast"],
  setup(props) {
    const {
      proyek,
      klien,
      pegawai,
      onAddProyek,
      onUpdateProyek,
      onAddKlien,
      onUpdateKlien,
      onDeleteProyek,
      onDeleteKlien,
      showToast
    }: CrmViewProps = props;
    const activeSubTab = ref('proyek'),
      setActiveSubTab = next => activeSubTab.value = typeof next === "function" ? next(activeSubTab.value) : next;
    const searchQuery = ref(''),
      setSearchQuery = next => searchQuery.value = typeof next === "function" ? next(searchQuery.value) : next;
    const statusFilter = ref('All'),
      setStatusFilter = next => statusFilter.value = typeof next === "function" ? next(statusFilter.value) : next;
    const selectedProjectDetailId = ref(null),
      setSelectedProjectDetailId = next => selectedProjectDetailId.value = typeof next === "function" ? next(selectedProjectDetailId.value) : next;
    const selectedClientDetailId = ref(null),
      setSelectedClientDetailId = next => selectedClientDetailId.value = typeof next === "function" ? next(selectedClientDetailId.value) : next;
    const editingProjectId = ref(null),
      setEditingProjectId = next => editingProjectId.value = typeof next === "function" ? next(editingProjectId.value) : next;
    const editingClientId = ref(null),
      setEditingClientId = next => editingClientId.value = typeof next === "function" ? next(editingClientId.value) : next;
    const deleteConfirm = ref(null),
      setDeleteConfirm = next => deleteConfirm.value = typeof next === "function" ? next(deleteConfirm.value) : next; // Form State for project initiation (Refactored to single-page to match the mockup)
    const isFormOpen = ref(false),
      setIsFormOpen = next => isFormOpen.value = typeof next === "function" ? next(isFormOpen.value) : next;
    const newProj = ref({
        nama: '',
        nilaiKontrak: 0,
        anggaran: 0,
        milestones: [] as any[],
        tipeTender: 'Tender Umum' as 'Tender Umum' | 'Tender Terbatas' | 'Penunjukan Langsung' | 'Pengadaan Langsung',
        status: 'Ongoing' as 'Planning' | 'Ongoing' | 'Completed',
        tanggalMulai: todayIso(),
        tanggalSelesai: '',
        klienId: '',
        // Default to empty string for "-- Pilih Perusahaan Klien --"
        picKontak: '',
        catatan: '',
        tim: [] as AnggotaTim[]
      }),
      setNewProj = next => newProj.value = typeof next === "function" ? next(newProj.value) : next;
    const isRegisteringNewClient = ref(false),
      setIsRegisteringNewClient = next => isRegisteringNewClient.value = typeof next === "function" ? next(isRegisteringNewClient.value) : next;
    const regClient = ref({
        namaPerusahaan: '',
        bidang: '',
        lokasi: '',
        pic: '',
        email: '',
        telepon: ''
      }),
      setRegClient = next => regClient.value = typeof next === "function" ? next(regClient.value) : next; // Employee team allocation inputs
    const selectedStaffId = ref(''),
      setSelectedStaffId = next => selectedStaffId.value = typeof next === "function" ? next(selectedStaffId.value) : next;
    const staffRole = ref(''),
      setStaffRole = next => staffRole.value = typeof next === "function" ? next(staffRole.value) : next;
    const allocationPercent = ref(50),
      setAllocationPercent = next => allocationPercent.value = typeof next === "function" ? next(allocationPercent.value) : next;
    const estimatedCost = ref(15000000),
      setEstimatedCost = next => estimatedCost.value = typeof next === "function" ? next(estimatedCost.value) : next;
    const manualStaffName = ref(''),
      setManualStaffName = next => manualStaffName.value = typeof next === "function" ? next(manualStaffName.value) : next;
    const manualStaffPosition = ref(''),
      setManualStaffPosition = next => manualStaffPosition.value = typeof next === "function" ? next(manualStaffPosition.value) : next;
    const milestoneTitle = ref(''),
      setMilestoneTitle = next => milestoneTitle.value = typeof next === "function" ? next(milestoneTitle.value) : next;
    const milestoneDate = ref(''),
      setMilestoneDate = next => milestoneDate.value = typeof next === "function" ? next(milestoneDate.value) : next;
    const milestoneStatus = ref('planned'),
      setMilestoneStatus = next => milestoneStatus.value = typeof next === "function" ? next(milestoneStatus.value) : next; // New Client Form Modal
    const isClientFormOpen = ref(false),
      setIsClientFormOpen = next => isClientFormOpen.value = typeof next === "function" ? next(isClientFormOpen.value) : next;
    const newClient = ref({
        namaPerusahaan: '',
        bidang: '',
        lokasi: '',
        pic: '',
        email: '',
        telepon: ''
      }),
      setNewClient = next => newClient.value = typeof next === "function" ? next(newClient.value) : next;
    const emptyProjectForm = {
      nama: '',
      nilaiKontrak: 0,
      anggaran: 0,
      milestones: [] as any[],
      tipeTender: 'Tender Umum' as const,
      status: 'Ongoing' as const,
      tanggalMulai: todayIso(),
      tanggalSelesai: '',
      klienId: '',
      picKontak: '',
      catatan: '',
      tim: [] as AnggotaTim[]
    };
    const resetProjectForm = () => {
      setEditingProjectId(null);
      setNewProj(emptyProjectForm);
      setIsRegisteringNewClient(false);
      setManualStaffName('');
      setManualStaffPosition('');
      setMilestoneTitle('');
      setMilestoneDate('');
      setMilestoneStatus('planned');
      setRegClient({
        namaPerusahaan: '',
        bidang: '',
        lokasi: '',
        pic: '',
        email: '',
        telepon: ''
      });
    };
    const resetClientForm = () => {
      setEditingClientId(null);
      setNewClient({
        namaPerusahaan: '',
        bidang: '',
        lokasi: '',
        pic: '',
        email: '',
        telepon: ''
      });
    };

    // Handle staff addition to list
    const handleAddStaff = () => {
      if (!selectedStaffId.value) return;
      const staffObj = pegawai.find(e => e.id === selectedStaffId.value);
      if (!staffObj) return;

      // Check duplication
      if (newProj.value.tim.some(t => t.nama === staffObj.nama)) {
        showToast('Karyawan sudah dialokasikan ke proyek ini.');
        return;
      }
      const item: AnggotaTim = {
        employeeId: String(staffObj?._raw?.id || ''),
        nama: staffObj.nama,
        jabatan: staffRole.value || staffObj.jabatan,
        alokasiPersen: allocationPercent.value,
        estimasiBiaya: estimatedCost.value
      };
      setNewProj(prev => ({
        ...prev,
        tim: [...prev.tim, item]
      }));
      showToast(`Berhasil menambahkan ${staffObj.nama} ke tim alokasi.`);
    };
    const handleRemoveStaff = (name: string) => {
      setNewProj(prev => ({
        ...prev,
        tim: prev.tim.filter(t => t.nama !== name)
      }));
    };
    const handleAddManualStaff = () => {
      const name = manualStaffName.value.trim();
      const position = manualStaffPosition.value.trim();
      if (!name || !position) {
        showToast('Harap isi nama dan posisi anggota tim.');
        return;
      }
      if (newProj.value.tim.some(t => t.nama.toLowerCase() === name.toLowerCase())) {
        showToast('Anggota tim sudah masuk dalam alokasi proyek ini.');
        return;
      }
      setNewProj(prev => ({
        ...prev,
        tim: [...prev.tim, {
          nama: name,
          jabatan: position,
          alokasiPersen: 100,
          estimasiBiaya: 0
        }]
      }));
      setManualStaffName('');
      setManualStaffPosition('');
    };
    const handleAddMilestone = () => {
      const title = milestoneTitle.value.trim();
      if (!title) {
        showToast('Harap isi nama milestone.');
        return;
      }
      setNewProj(prev => ({
        ...prev,
        milestones: [...(prev.milestones || []), {
          title,
          due_date: milestoneDate.value || null,
          status: milestoneStatus.value || 'planned'
        }]
      }));
      setMilestoneTitle('');
      setMilestoneDate('');
      setMilestoneStatus('planned');
    };
    const handleUpdateMilestone = (index: number, patch: any) => {
      setNewProj(prev => ({
        ...prev,
        milestones: (prev.milestones || []).map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item)
      }));
    };
    const handleRemoveMilestone = (index: number) => {
      setNewProj(prev => ({
        ...prev,
        milestones: (prev.milestones || []).filter((_, itemIndex) => itemIndex !== index)
      }));
    };

    // Submit complete single-page project form
    const handleSaveProject = async () => {
      if (!newProj.value.nama || !newProj.value.tanggalMulai || !newProj.value.tanggalSelesai) {
        showToast('Harap lengkapi nama proyek dan tanggal pelaksanaan.');
        return;
      }
      let finalKlienId = newProj.value.klienId;
      let finalPicKontak = newProj.value.picKontak;
      if (isRegisteringNewClient.value) {
        if (!regClient.value.namaPerusahaan || !regClient.value.pic) {
          showToast('Harap lengkapi nama perusahaan klien dan nama PIC.');
          return;
        }

        const clientItem: Klien = {
          id: '',
          namaPerusahaan: regClient.value.namaPerusahaan,
          bidang: regClient.value.bidang || 'Teknologi',
          lokasi: regClient.value.lokasi || 'Yogyakarta',
          pic: regClient.value.pic,
          email: regClient.value.email || 'pic@domain.co.id',
          telepon: regClient.value.telepon || '08123456789'
        };
        const createdClient = await onAddKlien(clientItem);
        const savedClientId = createdClient?.id || createdClient?._raw?.id;
        if (!savedClientId) {
          showToast('Klien baru belum berhasil disimpan. Proyek belum dibuat.');
          return;
        }
        finalKlienId = String(savedClientId);
        finalPicKontak = regClient.value.pic;
      } else {
        if (!newProj.value.klienId) {
          showToast('Harap pilih perusahaan klien atau daftarkan klien baru.');
          return;
        }
        const selectedClient = klien.find(k => k.id === newProj.value.klienId);
        finalPicKontak = selectedClient ? selectedClient.pic : '';
      }
      const projectItem: Proyek = {
        id: editingProjectId.value ? editingProjectId.value : '',
        ...newProj.value,
        klienId: finalKlienId,
        picKontak: finalPicKontak
      };
      if (editingProjectId.value) {
        const updatedProject = await onUpdateProyek(projectItem);
        if (!updatedProject) return;
        showToast('Proyek berhasil diperbarui.');
      } else {
        const createdProject = await onAddProyek(projectItem);
        if (!createdProject) return;
        showToast(isRegisteringNewClient.value ? 'Proyek baru & klien mitra berhasil disimpan dan diinisiasi.' : 'Proyek baru berhasil diinisiasi & disimpan.');
      }
      setIsFormOpen(false);
      resetProjectForm();
    };

    // Submit client form
    const handleSaveClient = async (e: Event) => {
      e.preventDefault();
      if (!newClient.value.namaPerusahaan || !newClient.value.pic) {
        showToast('Harap lengkapi nama perusahaan dan kontak PIC.');
        return;
      }
      const clientItem: Klien = {
        id: '',
        ...newClient.value
      };
      if (editingClientId.value) {
        clientItem.id = editingClientId.value;
        const updatedClient = await onUpdateKlien(clientItem);
        if (!updatedClient) return;
        showToast('Data klien berhasil diperbarui.');
        resetClientForm();
      } else {
        const createdClient = await onAddKlien(clientItem);
        if (!createdClient) return;
        showToast('Klien korporasi baru berhasil didaftarkan.');
        resetClientForm();
      }
      setIsClientFormOpen(false);
    };

    const openCreateProjectModal = () => {
      setSelectedProjectDetailId(null);
      setSelectedClientDetailId(null);
      resetProjectForm();
      setIsFormOpen(true);
    };
    const openCreateClientModal = () => {
      setSelectedProjectDetailId(null);
      setSelectedClientDetailId(null);
      resetClientForm();
      setIsClientFormOpen(true);
    };
    const openEditProjectModal = (project: Proyek) => {
      setSelectedProjectDetailId(null);
      setSelectedClientDetailId(null);
      setEditingProjectId(project.id);
      setIsRegisteringNewClient(false);
      setNewProj({
        ...project,
        tim: [...(project.tim || [])]
      });
      setIsFormOpen(true);
    };
    const openEditClientModal = (client: Klien) => {
      setSelectedProjectDetailId(null);
      setSelectedClientDetailId(null);
      setEditingClientId(client.id);
      setNewClient({ ...client });
      setIsClientFormOpen(true);
    };
    const closeProjectModal = () => {
      setIsFormOpen(false);
      setIsRegisteringNewClient(false);
      resetProjectForm();
    };
    const closeClientModal = () => {
      setIsClientFormOpen(false);
      resetClientForm();
    };

    // Filtering lists
    const filteredProjectsList = computed(() => proyek.filter(p => {
      const targetClient = klien.find(k => k.id === p.klienId);
      const matchesSearch = p.nama.toLowerCase().includes(searchQuery.value.toLowerCase()) || (targetClient?.namaPerusahaan || '').toLowerCase().includes(searchQuery.value.toLowerCase());
      const matchesStatus = statusFilter.value === 'All' || p.status === statusFilter.value;
      return matchesSearch && matchesStatus;
    }));
    const filteredClientsList = computed(() => klien.filter(k => {
      return k.namaPerusahaan.toLowerCase().includes(searchQuery.value.toLowerCase()) || k.pic.toLowerCase().includes(searchQuery.value.toLowerCase());
    }));
    return () => {
      const filteredProjects = filteredProjectsList.value;
      const filteredClients = filteredClientsList.value;
      const selectedProject = selectedProjectDetailId.value ? proyek.find(p => p.id === selectedProjectDetailId.value) ?? null : null;
      const selectedClient = selectedClientDetailId.value ? klien.find(k => k.id === selectedClientDetailId.value) ?? null : null;
      const selectedProjectClient = selectedProject ? klien.find(k => k.id === selectedProject.klienId) : undefined;

      return <div class="crm-workspace space-y-6">
      {/* Upper header action controls */}
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 class="text-xl font-extrabold text-[#0B1F4A] tracking-tight">Manajemen CRM & Proyek</h1>
          <p class="text-xs text-slate-400 font-light mt-1">Inisiasi proyek digital baru, alokasi pegawai SDM, serta registrasi mitra klien PT Kedata Indonesia Digital.</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="bg-slate-100 border border-slate-200 rounded-xl p-1 flex">
            <button id="subtab-proyek" onClick={() => {
              setActiveSubTab('proyek');
              setSearchQuery('');
            }} class={`text-xs px-4 py-2 font-semibold rounded-lg transition-all ${activeSubTab.value === 'proyek' ? 'bg-white text-[#0B1F4A] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
              Proyek
            </button>
            <button id="subtab-klien" onClick={() => {
              setActiveSubTab('klien');
              setSearchQuery('');
            }} class={`text-xs px-4 py-2 font-semibold rounded-lg transition-all ${activeSubTab.value === 'klien' ? 'bg-white text-[#0B1F4A] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
              Klien Partner
            </button>
          </div>

          <button id="btn-tambah-crm" onClick={() => activeSubTab.value === 'proyek' ? openCreateProjectModal() : openCreateClientModal()} class="bg-[#0B1F4A] hover:bg-[#1E3A8A] text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-md transition-all">
            <Plus class="w-4 h-4" /> 
            {activeSubTab.value === 'proyek' ? 'Inisiasi Proyek Baru' : 'Registrasi Klien Baru'}
          </button>
        </div>
      </div>

      {/* 1. Proyek Sub-Tab layout */}
      {activeSubTab.value === 'proyek' && <div class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-sm">
          <div class="flex flex-col gap-3 border-b border-[#E8EEF7] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="relative w-full lg:w-80"><span class="absolute inset-y-0 left-0 flex items-center pl-3 text-[#8A98AB]"><Search class="w-4 h-4" /></span><input id="crm-search-box" type="text" value={searchQuery.value} onChange={e => setSearchQuery(e.target.value)} placeholder="Cari nama proyek atau klien..." class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-[#FBFCFE] pl-9 pr-4 text-xs text-[#182338] outline-none placeholder:text-[#9AA9BC] focus:border-[#1E5AA8] focus:bg-white" /></div>
            <div class="flex flex-wrap items-center gap-2"><span class="text-xs text-[#6B7A90]"><Filter class="mr-1 inline h-3.5 w-3.5" />Status:</span>{['All', 'Planning', 'Ongoing', 'Completed'].map(status => <button id={`status-filter-${status}`} key={status} onClick={() => setStatusFilter(status as any)} class={`h-9 rounded-lg px-3 text-[11px] font-medium transition ${statusFilter.value === status ? 'bg-[#0B1F4A] text-white' : 'border border-[#DCE7F4] bg-white text-[#64748B] hover:bg-[#F8FBFE]'}`}>{status}</button>)}</div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-500">
              <thead class="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th class="p-4">Info Proyek</th>
                  <th class="p-4">Klien & Tim Alokasi</th>
                  <th class="p-4">Nilai Kontrak</th>
                  <th class="p-4 text-center">Status</th>
                  <th class="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-150">
                {filteredProjects.length === 0 ? <tr>
                    <td colSpan={5} class="p-12 text-center text-slate-400 font-light">
                      Tidak ada proyek yang sesuai dengan kriteria pencarian.
                    </td>
                  </tr> : filteredProjects.map(proj => {
                const clientObj = klien.find(k => k.id === proj.klienId);
                return <tr key={proj.id} class="hover:bg-slate-50 transition-colors">
                        <td class="p-4 space-y-1">
                          <span class="font-bold text-[#0B1F4A] block text-sm">{proj.nama}</span>
                          <div class="flex items-center gap-3 text-[10px] text-slate-400">
                            <span class="font-semibold">{proj.tipeTender}</span>
                            <span>&bull;</span>
                            <span class="font-mono">{proj.tanggalMulai} s/d {proj.tanggalSelesai}</span>
                          </div>
                        </td>
                        <td class="p-4 space-y-1.5">
                          <span class="font-bold text-slate-700 block">{clientObj?.namaPerusahaan || 'Klien Tidak Terdaftar'}</span>
                          <div class="flex flex-wrap gap-1">
                            {proj.tim.length === 0 ? <span class="text-[10px] text-slate-400 italic">Belum ada alokasi tim</span> : proj.tim.map((t, i) => <span key={i} class="bg-blue-50 border border-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-md" title={`${t.jabatan} - ${t.alokasiPersen}% Alokasi`}>
                                  {t.nama}
                                </span>)}
                          </div>
                        </td>
                        <td class="p-4 font-mono font-bold text-slate-800 text-sm">
                          {formatRupiah(proj.nilaiKontrak)}
                        </td>
                        <td class="p-4 text-center">
                          <span class={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${proj.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : proj.status === 'Ongoing' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                            {proj.status}
                          </span>
                        </td>
                        <td class="p-4">
                          <div class="flex items-center justify-center gap-1.5">
                            <button type="button" aria-label={`Lihat detail ${proj.nama}`} onClick={() => {
                        setSelectedProjectDetailId(proj.id);
                        setSelectedClientDetailId(null);
                      }} class="crm-action-button detail" title="Detail">
                          <Eye class="w-4 h-4" />
                        </button>
                        <button type="button" aria-label={`Edit ${proj.nama}`} onClick={() => openEditProjectModal(proj)} class="crm-action-button edit" title="Edit">
                          <Edit3 class="w-4 h-4" />
                        </button>
                            <button type="button" aria-label={`Hapus ${proj.nama}`} onClick={() => {
                        setDeleteConfirm({
                          type: 'proyek',
                          id: proj.id,
                          name: proj.nama
                        });
                      }} class="crm-action-button danger" title="Hapus">
                              <Trash2 class="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>;
              })}
              </tbody>
            </table>
          </div>
        </div>}

      {/* 2. Klien Sub-Tab layout */}
      {activeSubTab.value === 'klien' && <div class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-sm">
          <div class="flex flex-col gap-3 border-b border-[#E8EEF7] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="relative w-full sm:w-80"><span class="absolute inset-y-0 left-0 flex items-center pl-3 text-[#8A98AB]"><Search class="w-4 h-4" /></span><input id="crm-search-box" type="text" value={searchQuery.value} onChange={e => setSearchQuery(e.target.value)} placeholder="Cari perusahaan klien atau PIC..." class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-[#FBFCFE] pl-9 pr-4 text-xs text-[#182338] outline-none placeholder:text-[#9AA9BC] focus:border-[#1E5AA8] focus:bg-white" /></div>
            <span class="text-xs text-[#6B7A90]">{filteredClients.length} klien ditampilkan</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-500">
              <thead class="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th class="p-4">Nama Perusahaan</th>
                  <th class="p-4">Kategori Industri</th>
                  <th class="p-4">Lokasi Kantor</th>
                  <th class="p-4">Kontak PIC</th>
                  <th class="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-150">
                {filteredClients.length === 0 ? <tr>
                    <td colSpan={5} class="p-12 text-center text-slate-400 font-light">
                      Belum ada klien yang terdaftar.
                    </td>
                  </tr> : filteredClients.map(c => <tr key={c.id} class="hover:bg-slate-50 transition-colors">
                      <td class="p-4">
                        <span class="font-bold text-[#0B1F4A] block text-sm">{c.namaPerusahaan}</span>
                        <span class="text-[10px] text-slate-400 font-mono">{c.id}</span>
                      </td>
                      <td class="p-4 text-slate-600 font-semibold">{c.bidang}</td>
                      <td class="p-4 text-slate-500">
                        <span class="flex items-center gap-1"><MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0" /> {c.lokasi}</span>
                      </td>
                      <td class="p-4 space-y-1">
                        <span class="font-bold text-slate-700 block">{c.pic}</span>
                        <div class="flex flex-col text-[10px] text-slate-400 font-mono space-y-0.5">
                          <span class="flex items-center gap-1"><Mail class="w-3 h-3" /> {c.email}</span>
                          <span class="flex items-center gap-1"><Phone class="w-3 h-3" /> {c.telepon}</span>
                        </div>
                      </td>
                      <td class="p-4">
                        <div class="flex items-center justify-center gap-1.5">
                          <button type="button" aria-label={`Lihat detail ${c.namaPerusahaan}`} onClick={() => {
                      setSelectedClientDetailId(c.id);
                      setSelectedProjectDetailId(null);
                    }} class="crm-action-button detail" title="Detail">
                            <Eye class="w-4 h-4" />
                          </button>
                          <button type="button" aria-label={`Edit ${c.namaPerusahaan}`} onClick={() => openEditClientModal(c)} class="crm-action-button edit" title="Edit">
                            <Edit3 class="w-4 h-4" />
                          </button>
                          <button type="button" aria-label={`Hapus ${c.namaPerusahaan}`} onClick={() => {
                      setDeleteConfirm({
                        type: 'klien',
                        id: c.id,
                        name: c.namaPerusahaan
                      });
                    }} class="crm-action-button danger" title="Hapus">
                            <Trash2 class="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>)}
              </tbody>
            </table>
          </div>
        </div>}

      <Teleport to="body">
      {(selectedProject || selectedClient) && <div class="crm-modal-layer fixed inset-0 bg-[#111827]/55 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div class="crm-detail-modal bg-white border border-slate-100 rounded-3xl w-full overflow-hidden shadow-2xl">
            <div class="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-400">Detail CRM</p>
                <h3 class="mt-2 text-xl font-extrabold text-[#102A56] tracking-tight">
                  {selectedProject ? selectedProject.nama : selectedClient?.namaPerusahaan}
                </h3>
                <p class="mt-2 text-xs text-slate-500 max-w-2xl">
                  {selectedProject ? 'Detail lengkap proyek dan alokasi tim dalam CRM.' : 'Detail profil klien, kontak PIC, dan proyek terkait.'}
                </p>
              </div>
              <button onClick={() => {
              setSelectedProjectDetailId(null);
              setSelectedClientDetailId(null);
            }} class="w-11 h-11 flex shrink-0 items-center justify-center rounded-2xl border border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors">
                <X class="w-5 h-5" />
              </button>
            </div>
            <div class="crm-detail-body overflow-y-auto p-5">
              <div class="space-y-5">
              {selectedProject ? <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_220px]">
                  <div class="space-y-4">
                    <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                        <div class="space-y-1.5">
                          <span class={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${selectedProject.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : selectedProject.status === 'Ongoing' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                            {selectedProject.status}
                          </span>
                          <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Tender</p>
                          <p class="text-[13px] font-semibold text-slate-800">{selectedProject.tipeTender}</p>
                        </div>
                        <div class="md:text-right">
                          <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Nilai Kontrak</p>
                          <p class="mt-1 text-xl font-extrabold leading-tight text-slate-900">{formatRupiah(selectedProject.nilaiKontrak)}</p>
                        </div>
                      </div>
                      <div class="mt-4 grid gap-3 md:grid-cols-2">
                        <div class="rounded-2xl border border-slate-200 bg-white p-3">
                          <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Periode</p>
                          <p class="mt-2 text-[13px] font-semibold text-slate-700">{selectedProject.tanggalMulai} s/d {selectedProject.tanggalSelesai}</p>
                        </div>
                        <div class="rounded-2xl border border-slate-200 bg-white p-3">
                          <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">PIC Proyek</p>
                          <p class="mt-2 text-[13px] font-semibold text-slate-700">{selectedProject.picKontak}</p>
                        </div>
                      </div>
                    </div>

                    <div class="grid gap-3 md:grid-cols-2">
                      <div class="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                        <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">Kontrol Biaya</p>
                        <div class="mt-3 grid grid-cols-2 gap-3">
                          <div><p class="text-[10px] text-slate-500">Anggaran</p><p class="mt-1 text-sm font-extrabold text-slate-900">{formatRupiah(selectedProject.anggaran || 0)}</p></div>
                          <div><p class="text-[10px] text-slate-500">Realisasi bill</p><p class="mt-1 text-sm font-extrabold text-slate-900">{formatRupiah(selectedProject.realisasiBiaya || 0)}</p></div>
                          <div class="col-span-2 border-t border-blue-100 pt-2"><p class="text-[10px] text-slate-500">Sisa anggaran</p><p class={`mt-1 text-sm font-extrabold ${(selectedProject.selisihAnggaran || 0) < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>{formatRupiah(selectedProject.selisihAnggaran || 0)}</p></div>
                        </div>
                      </div>
                      <div class="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                        <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">Profitabilitas Proyek</p>
                        <div class="mt-3 grid grid-cols-2 gap-3">
                          <div><p class="text-[10px] text-slate-500">Invoice terbit</p><p class="mt-1 text-sm font-extrabold text-slate-900">{formatRupiah(selectedProject.realisasiPendapatan || 0)}</p></div>
                          <div><p class="text-[10px] text-slate-500">Laba aktual</p><p class={`mt-1 text-sm font-extrabold ${(selectedProject.labaAktual || 0) < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>{formatRupiah(selectedProject.labaAktual || 0)}</p></div>
                          <div class="col-span-2 border-t border-emerald-100 pt-2"><p class="text-[10px] text-slate-500">Proyeksi laba kontrak</p><p class={`mt-1 text-sm font-extrabold ${(selectedProject.proyeksiLaba || 0) < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>{formatRupiah(selectedProject.proyeksiLaba || 0)}</p></div>
                        </div>
                      </div>
                    </div>

                    <div class="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4">
                      <div class="flex items-center justify-between gap-3"><p class="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-700">Milestone & Deadline</p><span class="text-[10px] font-semibold text-slate-500">{(selectedProject.milestones || []).length} tahapan</span></div>
                      {(selectedProject.milestones || []).length === 0 ? <p class="mt-3 text-[12px] italic text-slate-500">Belum ada milestone yang dicatat untuk proyek ini.</p> : <div class="mt-3 space-y-2">{(selectedProject.milestones || []).map((milestone, index) => <div key={`${milestone.title}-${index}`} class="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-indigo-100 bg-white px-3 py-2"><div><p class="text-xs font-bold text-slate-800">{milestone.title}</p><p class="mt-0.5 text-[10px] text-slate-500">Target: {milestone.due_date || '-'}</p></div><span class={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ${milestone.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : milestone.status === 'in_progress' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>{milestone.status === 'completed' ? 'Selesai' : milestone.status === 'in_progress' ? 'Berjalan' : 'Direncanakan'}</span></div>)}</div>}
                    </div>

                    <div class="grid gap-3">
                      <div class="grid rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[170px_minmax(0,1fr)] md:items-center md:gap-5">
                        <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Klien Partner</p>
                        <div class="mt-2 md:mt-0">
                          <p class="text-[15px] font-bold text-slate-900">{selectedProjectClient?.namaPerusahaan || 'Klien tidak ditemukan'}</p>
                          <p class="mt-1 text-[13px] text-slate-500">PIC: {selectedProjectClient?.pic || selectedProject.picKontak}</p>
                        </div>
                      </div>
                      <div class="grid rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[170px_minmax(0,1fr)] md:items-start md:gap-5">
                        <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Catatan Proyek</p>
                        <p class="mt-2 text-[13px] text-slate-600 leading-relaxed md:mt-0">{selectedProject.catatan || 'Tidak ada catatan tambahan saat ini.'}</p>
                      </div>
                    </div>

                    <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Tim Terlibat</p>
                      {selectedProject.tim.length === 0 ? <p class="mt-3 text-[13px] text-slate-500 italic">Belum ada anggota tim yang dialokasikan.</p> : <div class="mt-3 grid gap-2.5 2xl:grid-cols-2">
                          {selectedProject.tim.map((member, index) => <div key={`${member.nama}-${index}`} class="grid rounded-2xl border border-slate-100 bg-white p-3 md:grid-cols-[minmax(0,1fr)_150px] md:items-center md:gap-3">
                              <div>
                                <p class="text-sm font-semibold text-slate-900">{member.nama}</p>
                                <p class="mt-1 text-[10px] uppercase tracking-[0.16em] text-slate-400">{member.jabatan}</p>
                              </div>
                              <p class="mt-2 text-[10px] leading-4 text-slate-500 md:mt-0 md:text-right">Alokasi {member.alokasiPersen}%<br />Est. biaya {formatRupiah(member.estimasiBiaya)}</p>
                            </div>)}
                        </div>}
                    </div>
                  </div>

                  <div class="space-y-4">
                    <div class="rounded-2xl border border-slate-200 bg-white p-4">
                      <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Ringkasan</p>
                      <div class="mt-4 space-y-3 text-[13px]">
                        <div>
                          <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Tender</p>
                          <p class="mt-1 font-semibold text-slate-800">{selectedProject.tipeTender}</p>
                        </div>
                        <div>
                          <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Status</p>
                          <p class="mt-1 font-semibold text-slate-800">{selectedProject.status}</p>
                        </div>
                        <div>
                          <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Jumlah Tim</p>
                          <p class="mt-1 font-semibold text-slate-800">{selectedProject.tim.length} orang</p>
                        </div>
                      </div>
                    </div>
                    <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Aksi Cepat</p>
                      <div class="mt-3 grid gap-2">
                        <button type="button" onClick={() => openEditProjectModal(selectedProject)} class="crm-modal-button primary">
                          <Edit3 class="h-4 w-4" /> Edit Proyek
                        </button>
                        <button type="button" onClick={() => setDeleteConfirm({
                          type: 'proyek',
                          id: selectedProject.id,
                          name: selectedProject.nama
                        })} class="crm-modal-button danger">
                          <Trash2 class="h-4 w-4" /> Hapus Proyek
                        </button>
                      </div>
                    </div>
                  </div>
                </div> : <div class="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
                  <div class="space-y-5">
                    <div class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <p class="text-[10px] uppercase text-slate-400 tracking-[0.2em]">Bidang Industri</p>
                      <h4 class="mt-3 text-xl font-extrabold text-slate-900">{selectedClient?.bidang}</h4>
                      <p class="mt-4 text-sm text-slate-600">{selectedClient?.lokasi}</p>
                    </div>
                    <div class="rounded-3xl border border-slate-200 p-5 bg-white">
                      <p class="text-[10px] uppercase text-slate-400 tracking-[0.2em]">Detail Kontak PIC</p>
                      <p class="mt-3 font-bold text-slate-900">{selectedClient?.pic}</p>
                      <p class="text-sm text-slate-600 mt-2"><Mail class="inline w-3 h-3 mr-1" /> {selectedClient?.email}</p>
                      <p class="text-sm text-slate-600"><Phone class="inline w-3 h-3 mr-1" /> {selectedClient?.telepon}</p>
                    </div>
                  </div>
                  <div class="space-y-5">
                    <div class="rounded-3xl border border-slate-200 p-5 bg-white">
                      <p class="text-[10px] uppercase text-slate-400 tracking-[0.2em]">Proyek Terhubung</p>
                      {proyek.filter(p => p.klienId === selectedClient?.id).length === 0 ? <p class="mt-4 text-sm text-slate-500 italic">Belum ada proyek yang terkait dengan klien ini.</p> : <div class="mt-4 space-y-3">
                          {proyek.filter(p => p.klienId === selectedClient?.id).map(project => <div key={project.id} class="rounded-3xl bg-slate-50 p-4 border border-slate-100">
                              <p class="font-bold text-slate-900">{project.nama}</p>
                              <p class="text-[10px] text-slate-500 mt-2">{project.status} · {project.tanggalMulai} s/d {project.tanggalSelesai}</p>
                            </div>)}
                        </div>}
                    </div>
                    <div class="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                      <button type="button" onClick={() => {
                      if (selectedClient) {
                        openEditClientModal(selectedClient);
                      }
                    }} class="crm-modal-button primary">
                        <Edit3 class="h-4 w-4" /> Edit Klien
                      </button>
                      <button type="button" onClick={() => selectedClient && setDeleteConfirm({
                        type: 'klien',
                        id: selectedClient.id,
                        name: selectedClient.namaPerusahaan
                      })} class="crm-modal-button danger mt-3">
                        <Trash2 class="h-4 w-4" /> Hapus Klien
                      </button>
                    </div>
                  </div>
                </div>}
            </div>
          </div>
        </div>
      </div>}

      {/* 3. CRM PROJECT INITIATION MODAL */}
      {isFormOpen.value && <div class="crm-modal-layer fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#111827]/55 p-3 backdrop-blur-sm sm:p-6" onClick={event => {
        if (event.target === event.currentTarget) closeProjectModal();
      }}>
          <div class="crm-project-modal flex w-full flex-col overflow-hidden rounded-[30px] border border-[#DCE7F4] bg-white shadow-2xl">
            {/* Modal Header */}
            <div class="flex shrink-0 items-start justify-between border-b border-[#E8EEF7] px-6 py-5 sm:px-8 sm:py-6">
              <div>
                <h3 class="text-xl font-extrabold tracking-tight text-[#102A56] sm:text-2xl">INISIASI PROJEK & KLIEN</h3>
                <span class="mt-1 block text-[10px] font-bold tracking-[0.16em] text-[#637083]">CRM & LIFECYCLE MANAGEMENT SYSTEM</span>
              </div>
              <button id="btn-close-project-modal" onClick={() => {
              closeProjectModal();
            }} class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#DCE7F4] text-[#94A3B8] transition-colors hover:bg-[#F8FBFE] hover:text-slate-600">
                <X class="w-6 h-6" />
              </button>
            </div>

            {/* Form body */}
            <div class="crm-project-body grid flex-1 gap-6 overflow-y-auto p-6 sm:p-8 lg:grid-cols-2 lg:p-8 2xl:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)_minmax(360px,0.9fr)]">
              
              {/* SECTION 1: DETAIL IDENTITAS PROJEK */}
              <div class="min-w-0 space-y-5 rounded-[24px] border border-[#D8E5F4] bg-[#F8FBFF] p-5 shadow-sm">
                <div class="flex items-center gap-3 border-b border-[#D8E5F4] pb-3">
                  <div class="p-2 bg-[#EEF4FB] rounded-xl text-[#1E5AA8] ring-1 ring-[#D8E5F4]">
                    <Briefcase class="w-5 h-5" />
                  </div>
                  <h4 class="text-[13px] font-extrabold tracking-[0.08em] text-[#102A56] uppercase">DETAIL IDENTITAS PROJEK</h4>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase">NAMA PROJEK / KEGIATAN</label>
                    <input id="proj-form-name" type="text" placeholder="Contoh: Pengembangan App E-Procurement" value={newProj.value.nama} onChange={e => setNewProj({
                    ...newProj.value,
                    nama: e.target.value
                  })} class="h-12 w-full min-w-0 rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-semibold text-[#152238] transition-all placeholder:font-medium placeholder:text-[#9AA9BE] focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20" />
                  </div>

                  <div class="space-y-2">
                    <label class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase">NILAI KONTRAK</label>
                    <div class="relative flex items-center">
                      <span class="absolute left-4 text-[#637083] font-bold text-xs select-none">Rp</span>
                      <input id="proj-form-val" type="number" placeholder="0" value={newProj.value.nilaiKontrak || ''} onChange={e => setNewProj({
                      ...newProj.value,
                      nilaiKontrak: Number(e.target.value)
                    })} class="h-12 w-full min-w-0 rounded-xl border border-[#D8E5F4] bg-white py-0 pl-12 pr-4 text-sm font-semibold text-[#152238] transition-all placeholder:font-medium placeholder:text-[#9AA9BE] focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20" />
                    </div>
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase">ANGGARAN BIAYA PROYEK</label>
                  <div class="relative flex items-center">
                    <span class="absolute left-4 text-[#637083] font-bold text-xs select-none">Rp</span>
                    <input id="proj-form-budget" type="number" min="0" placeholder="0" value={newProj.value.anggaran || ''} onChange={e => setNewProj({
                    ...newProj.value,
                    anggaran: Number(e.target.value)
                  })} class="h-12 w-full min-w-0 rounded-xl border border-[#D8E5F4] bg-white py-0 pl-12 pr-4 text-sm font-semibold text-[#152238] transition-all placeholder:font-medium placeholder:text-[#9AA9BE] focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20" />
                  </div>
                  <p class="text-[10px] leading-4 text-slate-500">Realisasi biaya otomatis dihitung dari bill yang dipilihkan ke proyek ini.</p>
                </div>

                <div class="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2 2xl:grid-cols-4 2xl:gap-x-6">
                  <div class="min-w-0 space-y-2">
                    <label class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase">TIPE TENDER</label>
                    <div class="relative">
                      <select id="proj-form-tender" title={newProj.value.tipeTender} value={newProj.value.tipeTender} onChange={e => setNewProj({
                      ...newProj.value,
                      tipeTender: e.target.value as any
                    })} class="h-12 w-full min-w-0 appearance-none rounded-xl border border-[#D8E5F4] bg-white px-3 pr-9 text-sm font-semibold text-[#152238] transition-all focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20">
                        <option value="Tender Umum">Tender Umum</option>
                        <option value="Tender Terbatas">Tender Terbatas</option>
                        <option value="Penunjukan Langsung">Penunjukan Langsung</option>
                        <option value="Pengadaan Langsung">Pengadaan Langsung</option>
                      </select>
                      <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#94A3B8]">
                        <ChevronDown class="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div class="min-w-0 space-y-2">
                    <label class="text-[10px] font-bold tracking-[0.08em] text-[#5B62D6] uppercase">STATUS PROJEK</label>
                    <div class="relative">
                      <select id="proj-form-status" title={newProj.value.status} value={newProj.value.status} onChange={e => setNewProj({
                      ...newProj.value,
                      status: e.target.value as any
                    })} class="h-12 w-full min-w-0 appearance-none rounded-xl border border-[#D8E5F4] bg-white px-3 pr-9 text-sm font-semibold text-[#152238] transition-all focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20">
                        <option value="Planning">Planning</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#94A3B8]">
                        <ChevronDown class="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div class="min-w-0 space-y-2">
                    <label class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase">TANGGAL MULAI</label>
                    <input id="proj-form-start" type="date" value={newProj.value.tanggalMulai} onChange={e => setNewProj({
                    ...newProj.value,
                    tanggalMulai: e.target.value
                  })} class="h-12 w-full min-w-0 rounded-xl border border-[#D8E5F4] bg-white px-3 text-sm font-semibold text-[#152238] transition-all focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20" />
                  </div>

                  <div class="min-w-0 space-y-2">
                    <label class="text-[10px] font-bold tracking-[0.08em] text-[#E25463] uppercase">EST. SELESAI</label>
                    <input id="proj-form-end" type="date" min={newProj.value.tanggalMulai || undefined} value={newProj.value.tanggalSelesai} onChange={e => setNewProj({
                    ...newProj.value,
                    tanggalSelesai: e.target.value
                  })} class="h-12 w-full min-w-0 rounded-xl border border-[#D8E5F4] bg-white px-3 text-sm font-semibold text-[#152238] transition-all focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20" />
                  </div>
                </div>
              </div>

              {/* SECTION: MILESTONE & DEADLINE */}
              <div class="min-w-0 space-y-4 rounded-[24px] border border-indigo-200 bg-indigo-50/30 p-5 shadow-sm">
                <div class="flex items-center gap-3 border-b border-indigo-200/70 pb-3">
                  <div class="p-2 bg-indigo-100 rounded-xl text-indigo-700 ring-1 ring-indigo-200">
                    <CheckCircle2 class="w-5 h-5" />
                  </div>
                  <div>
                    <h4 class="text-[13px] font-extrabold tracking-[0.08em] text-[#102A56] uppercase">MILESTONE & DEADLINE</h4>
                    <p class="mt-0.5 text-[10px] text-slate-500">Pantau tahapan kerja proyek dan tanggal targetnya.</p>
                  </div>
                </div>
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_150px_130px]">
                  <input id="proj-milestone-title" type="text" value={milestoneTitle.value} onChange={e => setMilestoneTitle(e.target.value)} placeholder="Contoh: UAT dan serah terima" class="h-11 min-w-0 rounded-xl border border-[#D8E5F4] bg-white px-3 text-xs font-semibold text-[#152238] focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20" />
                  <input id="proj-milestone-date" type="date" value={milestoneDate.value} onChange={e => setMilestoneDate(e.target.value)} class="h-11 min-w-0 rounded-xl border border-[#D8E5F4] bg-white px-3 text-xs font-semibold text-[#152238] focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20" />
                  <button type="button" onClick={handleAddMilestone} class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"><Plus class="h-4 w-4" /> Tambah</button>
                </div>
                <div class="space-y-2 rounded-2xl border border-dashed border-indigo-200 bg-white/60 p-3">
                  {(newProj.value.milestones || []).length === 0 ? <p class="text-[11px] font-semibold text-slate-400">Belum ada milestone. Tambahkan tahapan utama proyek agar deadline dapat dipantau.</p> : (newProj.value.milestones || []).map((milestone, index) => <div key={`${milestone.title}-${index}`} class="grid gap-2 rounded-xl border border-indigo-100 bg-white p-2.5 sm:grid-cols-[minmax(0,1fr)_132px_118px_32px] sm:items-center">
                    <p class="truncate text-xs font-bold text-slate-800" title={milestone.title}>{milestone.title}</p>
                    <input type="date" value={milestone.due_date || ''} onChange={e => handleUpdateMilestone(index, { due_date: e.target.value || null })} class="h-9 rounded-lg border border-slate-200 px-2 text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                    <select value={milestone.status || 'planned'} onChange={e => handleUpdateMilestone(index, { status: e.target.value })} class="h-9 rounded-lg border border-slate-200 px-2 text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"><option value="planned">Direncanakan</option><option value="in_progress">Berjalan</option><option value="completed">Selesai</option></select>
                    <button type="button" onClick={() => handleRemoveMilestone(index)} class="flex h-9 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="Hapus milestone"><Trash2 class="h-3.5 w-3.5" /></button>
                  </div>)}
                </div>
              </div>

              {/* SECTION: ALOKASI TIM SDM TERLIBAT */}
              <div class="min-w-0 space-y-5 rounded-[24px] border border-amber-200 bg-amber-50/35 p-5 shadow-sm">
                <div class="flex items-center gap-3 border-b border-amber-200/70 pb-3">
                  <div class="p-2 bg-amber-100 rounded-xl text-amber-700 ring-1 ring-amber-200">
                    <Users class="w-5 h-5" />
                  </div>
                  <h4 class="text-[13px] font-extrabold tracking-[0.08em] text-[#102A56] uppercase">ALOKASI TIM SDM TERLIBAT</h4>
                </div>

                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_148px] xl:items-end">
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase">NAMA ANGGOTA TIM</label>
                    <input id="proj-team-name" type="text" value={manualStaffName.value} onChange={e => setManualStaffName(e.target.value)} placeholder="Contoh: Arif Prasetyo" class="h-12 w-full min-w-0 rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-semibold text-[#152238] transition-all placeholder:font-medium placeholder:text-[#9AA9BE] focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20" />
                  </div>

                  <div class="space-y-2">
                    <label class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase">POSISI / ROLE</label>
                    <input id="proj-team-position" type="text" value={manualStaffPosition.value} onChange={e => setManualStaffPosition(e.target.value)} placeholder="Contoh: Project Manager" class="h-12 w-full min-w-0 rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-semibold text-[#152238] transition-all placeholder:font-medium placeholder:text-[#9AA9BE] focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20" />
                  </div>

                  <button id="btn-add-project-team" type="button" onClick={handleAddManualStaff} class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 text-sm font-bold text-white shadow-lg shadow-amber-500/15 transition-colors hover:bg-amber-600 sm:col-span-2 xl:col-span-1">
                    <Plus class="w-4 h-4" /> Tambah
                  </button>
                </div>

                <div class="min-h-[54px] rounded-2xl border border-dashed border-amber-200 bg-amber-50/40 p-3">
                  {newProj.value.tim.length === 0 ? <span class="text-[11px] text-slate-400 font-semibold">Belum ada anggota tim yang dialokasikan.</span> : <div class="flex flex-wrap gap-2">
                      {newProj.value.tim.map(member => <div key={member.nama} class="flex items-center gap-2 rounded-xl bg-white border border-amber-100 px-3 py-2 shadow-sm">
                          <div>
                            <span class="block text-xs font-extrabold text-[#102A56]">{member.nama}</span>
                            <span class="block text-[10px] font-bold text-amber-600 uppercase tracking-wide">{member.jabatan}</span>
                          </div>
                          <button type="button" onClick={() => handleRemoveStaff(member.nama)} class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" title="Hapus anggota tim">
                            <X class="w-3.5 h-3.5" />
                          </button>
                        </div>)}
                    </div>}
                </div>
              </div>

              {/* SECTION 2: INFORMASI KLIEN PARTNER */}
              <div class="min-w-0 space-y-6 rounded-[22px] border border-[#D8E5F4] bg-[#FBFDFF] p-5 shadow-sm sm:p-6 lg:col-span-2 2xl:col-span-1">
                {/* Section header inside the box */}
                <div class="flex flex-col gap-3 border-b border-[#D8E5F4] pb-3 sm:flex-row sm:items-center sm:justify-between">
                  <div class="flex items-center gap-2.5">
                    <div class="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                      <Building class="w-4 h-4" />
                    </div>
                    <h4 class="font-extrabold text-[11px] tracking-wider text-[#102A56] uppercase">INFORMASI KLIEN PARTNER</h4>
                  </div>
                  <div class="grid grid-cols-2 rounded-xl border border-[#D8E5F4] bg-white p-1 text-[11px] font-bold">
                    <button type="button" onClick={() => setIsRegisteringNewClient(false)} class={`rounded-lg px-3 py-2 transition ${!isRegisteringNewClient.value ? 'bg-[#102A56] text-white shadow-sm' : 'text-[#637083] hover:bg-[#F8FBFE]'}`}>
                      Database
                    </button>
                    <button type="button" onClick={() => setIsRegisteringNewClient(true)} class={`rounded-lg px-3 py-2 transition ${isRegisteringNewClient.value ? 'bg-[#102A56] text-white shadow-sm' : 'text-[#637083] hover:bg-[#F8FBFE]'}`}>
                      Klien Baru
                    </button>
                  </div>
                </div>

                {/* Conditionally render database selection or new client registration form */}
                {!isRegisteringNewClient.value ? <div class="space-y-2">
                    <label class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase">PILIH KLIEN DARI DATABASE</label>
                    <div class="relative">
                      <select id="proj-form-klien" value={newProj.value.klienId} onChange={e => setNewProj({
                    ...newProj.value,
                    klienId: e.target.value
                  })} class="h-12 w-full min-w-0 appearance-none rounded-xl border border-[#D8E5F4] bg-white px-4 pr-12 text-sm font-semibold text-[#152238] transition-all focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20">
                        <option value="">-- Pilih Perusahaan Klien --</option>
                        {klien.map(k => <option key={k.id} value={k.id}>{k.namaPerusahaan} ({k.pic})</option>)}
                      </select>
                      <div class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#94A3B8]">
                        <ChevronDown class="w-4 h-4" />
                      </div>
                    </div>
                  </div> : (/* Form for Registering New Client inline */
              <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div class="space-y-1.5">
                        <label class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase">NAMA PERUSAHAAN / KEMENTERIAN *</label>
                        <input type="text" placeholder="Contoh: PT Kereta Api Indonesia (Persero)" value={regClient.value.namaPerusahaan} onChange={e => setRegClient({
                      ...regClient.value,
                      namaPerusahaan: e.target.value
                    })} class="w-full p-3 bg-[#EEF4FB]/30 border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white text-slate-800 text-xs font-bold transition-all" />
                      </div>
                      <div class="space-y-1.5">
                        <label class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase">BIDANG & KATEGORI</label>
                        <input type="text" placeholder="Contoh: BUMN / Transportasi" value={regClient.value.bidang} onChange={e => setRegClient({
                      ...regClient.value,
                      bidang: e.target.value
                    })} class="w-full p-3 bg-[#EEF4FB]/30 border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white text-slate-800 text-xs font-bold transition-all" />
                      </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div class="space-y-1.5">
                        <label class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase">LOKASI KANTOR CABANG</label>
                        <input type="text" placeholder="Contoh: Bandung, Jawa Barat" value={regClient.value.lokasi} onChange={e => setRegClient({
                      ...regClient.value,
                      lokasi: e.target.value
                    })} class="w-full p-3 bg-[#EEF4FB]/30 border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white text-slate-800 text-xs font-bold transition-all" />
                      </div>
                      <div class="space-y-1.5">
                        <label class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase">NAMA PIC UTAMA *</label>
                        <input type="text" placeholder="Contoh: Dr. Ir. Heru Wibowo, M.T." value={regClient.value.pic} onChange={e => setRegClient({
                      ...regClient.value,
                      pic: e.target.value
                    })} class="w-full p-3 bg-[#EEF4FB]/30 border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white text-slate-800 text-xs font-bold transition-all" />
                      </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div class="space-y-1.5">
                        <label class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase">EMAIL KERJA PIC</label>
                        <input type="email" placeholder="Contoh: pic.proyek@kai.id" value={regClient.value.email} onChange={e => setRegClient({
                      ...regClient.value,
                      email: e.target.value
                    })} class="w-full p-3 bg-[#EEF4FB]/30 border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white text-slate-800 text-xs font-bold transition-all" />
                      </div>
                      <div class="space-y-1.5">
                        <label class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase">NOMOR TELEPON PIC</label>
                        <input type="text" placeholder="Contoh: +62 811-2345-678" value={regClient.value.telepon} onChange={e => setRegClient({
                      ...regClient.value,
                      telepon: e.target.value
                    })} class="w-full p-3 bg-[#EEF4FB]/30 border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white text-slate-800 text-xs font-bold transition-all" />
                      </div>
                    </div>
                  </div>)}
              </div>
            </div>

            {/* Modal footer controls */}
            <div class="flex shrink-0 flex-col-reverse gap-3 border-t border-[#E8EEF7] bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5">
              <button id="btn-project-cancel" type="button" onClick={() => {
              closeProjectModal();
            }} class="h-12 w-full rounded-xl border border-[#D8E5F4] px-8 text-sm font-bold tracking-wide text-[#637083] transition-all hover:bg-slate-50 sm:w-auto">
                BATAL
              </button>

              <button id="btn-project-save" type="button" onClick={handleSaveProject} class="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#102A56] px-8 text-sm font-bold tracking-wide text-white shadow-lg transition-all hover:bg-[#0B1F42] sm:w-auto">
                <CheckCircle2 class="w-4 h-4" /> SELESAIKAN INISIASI PROJEK
              </button>
            </div>
          </div>
        </div>}

      {/* 4. REGISTRASI KLIEN BARU STANDALONE MODAL */}
      {isClientFormOpen.value && <div class="crm-modal-layer fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#111827]/55 p-4 backdrop-blur-sm" onClick={event => {
        if (event.target === event.currentTarget) closeClientModal();
      }}>
          <div class="crm-client-modal bg-white border border-slate-100 rounded-[36px] w-full max-w-2xl overflow-hidden shadow-2xl">
            <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h3 class="font-extrabold text-xl text-[#102A56] tracking-tight uppercase">{editingClientId.value ? 'Edit Mitra Klien' : 'Registrasi Mitra Klien Baru'}</h3>
                <span class="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest block mt-1">CRM & Lifecycle Management System</span>
              </div>
              <button id="btn-close-client-modal" onClick={closeClientModal} class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#DCE7F4] text-[#94A3B8] transition-colors hover:bg-[#F8FBFE] hover:text-slate-600">
                <X class="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} class="p-8 space-y-6 text-xs">
              <div class="flex items-center gap-2.5 pb-3 border-b border-[#D8E5F4]">
                <div class="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                  <Building class="w-4 h-4" />
                </div>
                <h4 class="font-extrabold text-[11px] tracking-wider text-[#102A56] uppercase">Informasi Klien Partner</h4>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1.5 md:col-span-2">
                  <label class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase">Nama Perusahaan / Kementerian *</label>
                  <input id="client-form-company" type="text" required placeholder="Contoh: PT Kereta Api Indonesia (Persero)" value={newClient.value.namaPerusahaan} onChange={e => setNewClient({
                  ...newClient.value,
                  namaPerusahaan: e.target.value
                })} class="h-12 w-full min-w-0 rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-semibold text-[#152238] transition-all placeholder:font-medium placeholder:text-[#9AA9BE] focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20" />
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase">Bidang & Kategori</label>
                  <input id="client-form-category" type="text" placeholder="Contoh: BUMN / Transportasi" value={newClient.value.bidang} onChange={e => setNewClient({
                  ...newClient.value,
                  bidang: e.target.value
                })} class="h-12 w-full min-w-0 rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-semibold text-[#152238] transition-all placeholder:font-medium placeholder:text-[#9AA9BE] focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20" />
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase">Lokasi Kantor Cabang</label>
                  <input id="client-form-location" type="text" placeholder="Contoh: Bandung, Jawa Barat" value={newClient.value.lokasi} onChange={e => setNewClient({
                  ...newClient.value,
                  lokasi: e.target.value
                })} class="h-12 w-full min-w-0 rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-semibold text-[#152238] transition-all placeholder:font-medium placeholder:text-[#9AA9BE] focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20" />
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase">Nama PIC Utama *</label>
                  <input id="client-form-pic" type="text" required placeholder="Contoh: Dr. Ir. Heru Wibowo, M.T." value={newClient.value.pic} onChange={e => setNewClient({
                  ...newClient.value,
                  pic: e.target.value
                })} class="h-12 w-full min-w-0 rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-semibold text-[#152238] transition-all placeholder:font-medium placeholder:text-[#9AA9BE] focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20" />
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase">Email Kerja PIC</label>
                  <input id="client-form-email" type="email" placeholder="Contoh: pic.proyek@kai.id" value={newClient.value.email} onChange={e => setNewClient({
                  ...newClient.value,
                  email: e.target.value
                })} class="h-12 w-full min-w-0 rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-semibold text-[#152238] transition-all placeholder:font-medium placeholder:text-[#9AA9BE] focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20" />
                </div>
                <div class="space-y-1.5 md:col-span-2">
                  <label class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase">Nomor Telepon PIC</label>
                  <input id="client-form-phone" type="text" placeholder="Contoh: +62 811-2345-678" value={newClient.value.telepon} onChange={e => setNewClient({
                  ...newClient.value,
                  telepon: e.target.value
                })} class="h-12 w-full min-w-0 rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-semibold text-[#152238] transition-all placeholder:font-medium placeholder:text-[#9AA9BE] focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20" />
                </div>
              </div>

              <button id="btn-client-submit" type="submit" class="w-full bg-[#102A56] hover:bg-[#0B1F42] text-white font-extrabold py-4 rounded-2xl shadow-lg mt-2 transition-all flex items-center justify-center gap-2 uppercase tracking-wider">
                <CheckCircle2 class="w-4 h-4" /> {editingClientId.value ? 'Simpan Perubahan Klien' : 'Daftarkan Klien Baru'}
              </button>
            </form>
          </div>
        </div>}

      {deleteConfirm.value && <div class="crm-modal-layer fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#111827]/55 p-4 backdrop-blur-sm" onClick={event => {
        if (event.target === event.currentTarget) setDeleteConfirm(null);
      }}>
          <div class="crm-delete-modal w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div class="border-b border-slate-200 px-6 py-5">
              <div>
                <p class="text-[11px] font-bold uppercase tracking-[0.16em] text-rose-500">Konfirmasi Penghapusan</p>
                <h3 class="mt-1 text-lg font-extrabold leading-tight text-[#102A56]">Hapus {deleteConfirm.value.type === 'proyek' ? 'Proyek' : 'Klien'}?</h3>
              </div>
            </div>
            <div class="space-y-4 p-6">
              <p class="text-sm leading-6 text-slate-600">
                Periksa kembali data di bawah ini sebelum melanjutkan. Penghapusan bersifat permanen dan tidak dapat dibatalkan dari aplikasi.
              </p>

              <div class="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 grid-cols-1">
                <div>
                  <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Jenis Data</p>
                  <p class="mt-1 text-sm font-bold text-slate-900">{deleteConfirm.value.type === 'proyek' ? 'Proyek CRM' : 'Klien Partner'}</p>
                </div>
                <div>
                  <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Nama</p>
                  <p class="mt-1 text-sm font-bold leading-6 text-slate-900">{deleteConfirm.value.name}</p>
                </div>
                <div>
                  <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">ID</p>
                  <p class="mt-1 font-mono text-sm font-semibold text-slate-700">{deleteConfirm.value.id}</p>
                </div>
              </div>

              <div class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-950">
                <p class="font-bold text-rose-700">Yang akan terdampak</p>
                {deleteConfirm.value.type === 'proyek' ? <ul class="mt-2 list-disc space-y-1 pl-5">
                    <li>Proyek hilang dari daftar CRM.</li>
                    <li>Detail kontrak, status, periode, catatan, dan alokasi tim ikut terhapus.</li>
                    <li>Riwayat ini tidak bisa dipulihkan melalui aplikasi.</li>
                  </ul> : <ul class="mt-2 list-disc space-y-1 pl-5">
                    <li>Klien hilang dari database CRM.</li>
                    <li>Klien tidak lagi tersedia di pilihan proyek baru atau edit proyek.</li>
                    <li>Riwayat ini tidak bisa dipulihkan melalui aplikasi.</li>
                  </ul>}
              </div>

              <div class="grid grid-cols-1 gap-3 pt-2">
                <button type="button" onClick={() => setDeleteConfirm(null)} class="w-full rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50">
                  Batalkan
                </button>
                <button type="button" onClick={() => {
                if (deleteConfirm.value.type === 'proyek') {
                  onDeleteProyek(deleteConfirm.value.id);
                  showToast('Proyek berhasil dihapus.');
                } else {
                  onDeleteKlien(deleteConfirm.value.id);
                  showToast('Klien berhasil dihapus.');
                }
                setSelectedProjectDetailId(null);
                setSelectedClientDetailId(null);
                setDeleteConfirm(null);
              }} class="w-full rounded-2xl bg-rose-600 py-3 text-sm font-bold text-white transition-colors hover:bg-rose-700">
                  Hapus {deleteConfirm.value.type === 'proyek' ? 'Proyek' : 'Klien'}
                </button>
              </div>
            </div>
          </div>
        </div>}
      </Teleport>
    </div>;
    };
  }
});
</script>

<style scoped>
.crm-workspace {
  min-width: 0;
  width: 100%;
}

.crm-workspace table {
  table-layout: fixed;
  min-width: 1180px;
}

.crm-workspace th,
.crm-workspace td {
  vertical-align: middle;
}

.crm-workspace th:first-child,
.crm-workspace td:first-child {
  width: 34%;
}

.crm-workspace th:nth-child(2),
.crm-workspace td:nth-child(2) {
  width: 30%;
}

.crm-workspace th:nth-child(3),
.crm-workspace td:nth-child(3) {
  width: 16%;
}

.crm-workspace th:nth-child(4),
.crm-workspace td:nth-child(4) {
  width: 12%;
}

.crm-workspace th:last-child,
.crm-workspace td:last-child {
  width: 176px;
}

.crm-workspace td span,
.crm-workspace td p {
  overflow-wrap: anywhere;
}

.crm-action-button {
  display: inline-flex;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  align-items: center;
  justify-content: center;
  border: 1px solid #dce7f4;
  border-radius: 14px;
  background: #f8fbfe;
  color: #637083;
  transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
}

.crm-action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(16, 42, 86, 0.12);
}

.crm-action-button.detail {
  background: #eef6ff;
  color: #1e5aa8;
}

.crm-action-button.edit {
  background: #fff7e8;
  color: #b86b00;
}

.crm-action-button.danger {
  background: #fff1f3;
  color: #d93858;
}

.crm-modal-layer {
  overscroll-behavior: contain;
  z-index: 9999 !important;
}

.crm-detail-modal,
.crm-project-modal,
.crm-client-modal,
.crm-delete-modal {
  max-width: calc(100vw - 32px);
  max-height: min(84dvh, calc(100dvh - 72px));
}

.crm-detail-modal {
  width: min(1120px, calc(100vw - 48px));
}

.crm-project-modal {
  width: min(1080px, calc(100vw - 48px));
  max-height: min(84dvh, calc(100dvh - 72px));
}

.crm-client-modal {
  width: min(860px, calc(100vw - 48px));
  overflow-y: auto;
}

.crm-delete-modal {
  overflow-y: auto;
  max-width: min(520px, calc(100vw - 32px)) !important;
  width: 100%;
}

.crm-detail-body,
.crm-project-body {
  min-height: 0;
}

.crm-detail-body {
  max-height: calc(84dvh - 122px);
}

.crm-project-body {
  max-height: calc(84dvh - 158px);
}

.crm-modal-button {
  display: inline-flex;
  min-height: 46px;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 16px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 800;
  transition: background-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
}

.crm-modal-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(16, 42, 86, 0.12);
}

.crm-modal-button.primary {
  background: #0b1f4a;
  color: #ffffff;
}

.crm-modal-button.danger {
  border: 1px solid #fecdd3;
  background: #fff1f3;
  color: #be123c;
}

@media (max-width: 767px) {
  .crm-workspace table {
    min-width: 980px;
  }

  .crm-detail-modal,
  .crm-project-modal,
  .crm-client-modal,
  .crm-delete-modal {
    max-width: calc(100vw - 20px);
    max-height: calc(100dvh - 20px);
    border-radius: 22px;
  }

  .crm-detail-body {
    max-height: calc(100dvh - 142px);
  }

  .crm-project-body {
    max-height: calc(100dvh - 174px);
    padding: 16px;
  }
}
</style>
