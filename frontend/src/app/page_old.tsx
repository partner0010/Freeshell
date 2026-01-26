"use client";

import { useEffect, useRef, useState } from "react";

import Alert from "../components/Alert";
import Badge from "../components/Badge";
import Banner from "../components/Banner";
import BannerAction from "../components/BannerAction";
import DismissibleBanner from "../components/DismissibleBanner";
import BarChart from "../components/BarChart";
import Button from "../components/Button";
import Breadcrumbs from "../components/Breadcrumbs";
import Card from "../components/Card";
import CardGrid from "../components/CardGrid";
import Container from "../components/Container";
import CardList from "../components/CardList";
import Accordion from "../components/Accordion";
import DataTable from "../components/DataTable";
import DatePicker from "../components/DatePicker";
import CheckboxGroup from "../components/CheckboxGroup";
import Drawer from "../components/Drawer";
import Dropdown from "../components/Dropdown";
import EmptyState from "../components/EmptyState";
import ExampleCard from "../components/ExampleCard";
import FileUpload from "../components/FileUpload";
import FilterChips from "../components/FilterChips";
import FormField from "../components/FormField";
import Icon from "../components/Icon";
import InputField from "../components/InputField";
import List from "../components/List";
import LineChart from "../components/LineChart";
import MetricCard from "../components/MetricCard";
import Modal from "../components/Modal";
import NotificationList from "../components/NotificationList";
import Overlay from "../components/Overlay";
import Pagination from "../components/Pagination";
import ProfileCard from "../components/ProfileCard";
import ProgressBar from "../components/ProgressBar";
import RadioGroup from "../components/RadioGroup";
import RangeSlider from "../components/RangeSlider";
import SearchInput from "../components/SearchInput";
import SelectField from "../components/SelectField";
import Sidebar from "../components/Sidebar";
import Skeleton from "../components/Skeleton";
import Spinner from "../components/Spinner";
import AvatarGroup from "../components/AvatarGroup";
import SegmentedControl from "../components/SegmentedControl";
import Stepper from "../components/Stepper";
import TagInput from "../components/TagInput";
import Text from "../components/Text";
import TextareaField from "../components/TextareaField";
import Timeline from "../components/Timeline";
import Toast from "../components/Toast";
import ToastStack from "../components/ToastStack";
import Tabs from "../components/Tabs";
import PageHeader from "../components/PageHeader";
import Topbar from "../components/Topbar";
import Toggle from "../components/Toggle";
import TwoColumnLayout from "../components/TwoColumnLayout";
import ThreeColumnLayout from "../components/ThreeColumnLayout";
import ThemeToggle from "../components/ThemeToggle";
import Tooltip from "../components/Tooltip";
import DropdownMenu from "../components/DropdownMenu";
import ValidationMessage from "../components/ValidationMessage";
import { getHealth } from "../lib/api";
import AuthLayout from "../components/layouts/AuthLayout";
import DashboardLayout from "../components/layouts/DashboardLayout";
import LandingLayout from "../components/layouts/LandingLayout";
import { Button as UiButton } from "../components/ui/button";
import { Input as UiInput, FileInput } from "../components/ui/input";
import { Textarea as UiTextarea } from "../components/ui/textarea";
import {
  Card as UiCard,
  CardContent as UiCardContent,
  CardDescription as UiCardDescription,
  CardFooter as UiCardFooter,
  CardHeader as UiCardHeader,
  CardTitle as UiCardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { toast } from "../hooks/use-toast";
import { Toaster as UiToaster } from "../components/ui/toaster";
import { Spinner as UiSpinner } from "../components/ui/spinner";
import { Progress as UiProgress } from "../components/ui/progress";
import {
  Tabs as UiTabs,
  TabsContent as UiTabsContent,
  TabsList as UiTabsList,
  TabsTrigger as UiTabsTrigger,
} from "../components/ui/tabs";
import {
  DropdownMenu as UiDropdownMenu,
  DropdownMenuContent as UiDropdownMenuContent,
  DropdownMenuItem as UiDropdownMenuItem,
  DropdownMenuLabel as UiDropdownMenuLabel,
  DropdownMenuSeparator as UiDropdownMenuSeparator,
  DropdownMenuTrigger as UiDropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Avatar as UiAvatar, AvatarFallback as UiAvatarFallback } from "../components/ui/avatar";

export default function HomePage() {
  const [healthStatus, setHealthStatus] = useState<string>("로딩 중...");
  const [healthError, setHealthError] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [activeStep, setActiveStep] = useState("step-1");
  const [selectedRole, setSelectedRole] = useState("designer");
  const [selectedDate, setSelectedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [tags, setTags] = useState<string[]>(["design", "ui"]);
  const [activeFilters, setActiveFilters] = useState<string[]>(["all"]);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>(["analytics"]);
  const [selectedRadio, setSelectedRadio] = useState("basic");
  const [rangeValue, setRangeValue] = useState(40);
  const [progressValue, setProgressValue] = useState(65);
  const [activeSegment, setActiveSegment] = useState("daily");
  const [openAccordion, setOpenAccordion] = useState("item-1");
  const [activeSidebar, setActiveSidebar] = useState("overview");
  const [isDark, setIsDark] = useState(false);
  const [sortKey, setSortKey] = useState<"id" | "name" | "role" | "status">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showEmptyTable, setShowEmptyTable] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [toastPosition, setToastPosition] = useState<
    "top-left" | "top-right" | "bottom-left" | "bottom-right"
  >("top-right");
  const [pauseToastStack, setPauseToastStack] = useState(false);
  const [showPauseBadge, setShowPauseBadge] = useState(false);
  const [toastRemainingBadge, setToastRemainingBadge] = useState(true);
  const [clickedRow, setClickedRow] = useState<string | null>(null);
  const toastAnimationFrom = toastPosition.startsWith("bottom") ? "bottom" : "top";
  const [uiDialogOpen, setUiDialogOpen] = useState(false);
  const [uiTabValue, setUiTabValue] = useState("account");
  const [uiProgressValue, setUiProgressValue] = useState(45);
  const [authEmail, setAuthEmail] = useState("jinha@example.com");
  const [authPassword, setAuthPassword] = useState("");
  const [authRemember, setAuthRemember] = useState(true);
  const [authShowPassword, setAuthShowPassword] = useState(false);
  const [authAttempted, setAuthAttempted] = useState(false);
  const [authEmailTouched, setAuthEmailTouched] = useState(false);
  const [authPasswordTouched, setAuthPasswordTouched] = useState(false);
  const [authAgreeTerms, setAuthAgreeTerms] = useState(false);
  const [authCapsLock, setAuthCapsLock] = useState(false);
  const [dashboardFilter, setDashboardFilter] = useState<"all" | "mine">("all");
  const [dashboardNotifications, setDashboardNotifications] = useState(3);
  const [dashboardSort, setDashboardSort] = useState<"status" | "title">("status");
  const [dashboardQuery, setDashboardQuery] = useState("");
  const [dashboardStatusFilter, setDashboardStatusFilter] = useState<
    "all" | "완료" | "진행중" | "대기"
  >("all");
  const [dashboardTagFilters, setDashboardTagFilters] = useState<string[]>([]);
  const [dashboardTaskState, setDashboardTaskState] = useState(() => [
    { id: "task-1", title: "UI 리뷰", owner: "me", status: "완료", tags: ["design", "review"] },
    { id: "task-2", title: "배포 체크", owner: "me", status: "진행중", tags: ["release"] },
    { id: "task-3", title: "문서 업데이트", owner: "team", status: "대기", tags: ["docs"] },
  ]);
  const [landingBilling, setLandingBilling] = useState<"monthly" | "yearly">("monthly");
  const [landingEmail, setLandingEmail] = useState("");
  const [landingEmailTouched, setLandingEmailTouched] = useState(false);
  const [landingEmailAttempted, setLandingEmailAttempted] = useState(false);
  const [landingSubscribed, setLandingSubscribed] = useState(false);
  const [landingFaqOpen, setLandingFaqOpen] = useState("faq-1");
  const [landingEventLog, setLandingEventLog] = useState<string[]>([]);
  const [dashboardPresetName, setDashboardPresetName] = useState("");
  const [dashboardActivePresetId, setDashboardActivePresetId] = useState<string | null>(null);
  const [dashboardPresetError, setDashboardPresetError] = useState<string | null>(null);
  const [dashboardPresets, setDashboardPresets] = useState<
    Array<{
      id: string;
      label: string;
      filter: "all" | "mine";
      status: "all" | "완료" | "진행중" | "대기";
      query: string;
      tags: string[];
    }>
  >([]);
  const [tableDensity, setTableDensity] = useState<"comfortable" | "compact">("comfortable");
  const [budgetRaw, setBudgetRaw] = useState("250000");
  const [description, setDescription] = useState("");
  const [tokenValue, setTokenValue] = useState("tok_sample_1234");
  const [tableResetKey, setTableResetKey] = useState(0);
  const [tableResetAnnouncement, setTableResetAnnouncement] = useState("");
  const resetAnnounceTimerRef = useRef<number | null>(null);
  const [tableQuery, setTableQuery] = useState("");
  const [tableFilters, setTableFilters] = useState<string[]>(["all"]);
  const maxToastCount = 4;
  const [hiddenColumns, setHiddenColumns] = useState<
    Array<"name" | "role" | "status">
  >([]);
  const [columnOrder, setColumnOrder] = useState<
    Array<"name" | "role" | "status">
  >(["name", "role", "status"]);
  const [toastStack, setToastStack] = useState<
    {
      id: number;
      title: string;
      description?: string;
      variant: "success" | "info" | "warning" | "error";
      autoDismissMs?: number;
    }[]
  >([
    {
      id: 1,
      title: "Sync 완료",
      description: "최신 상태로 업데이트됨",
      variant: "success",
      autoDismissMs: 3000,
    },
  ]);

  type TableRow = { id: string; name: string; role: string; status: string; };
  type TableColumn<T> = {
    key: keyof T;
    label: string;
    sortable?: boolean;
    widthClass?: string;
    align?: "left" | "center" | "right";
    pin?: "left" | "right";
    resizable?: boolean;
    widthPx?: number;
    minWidthPx?: number;
    maxWidthPx?: number;
  };

  const dataTableColumns: TableColumn<TableRow>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      widthClass: "w-1/2",
      pin: "left",
      resizable: true,
      minWidthPx: 140,
    },
    {
      key: "role",
      label: "Role",
      sortable: false,
      widthClass: "w-1/4",
      resizable: true,
      minWidthPx: 120,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      widthClass: "w-1/4",
      align: "right",
      pin: "right",
      resizable: true,
      minWidthPx: 120,
    },
  ];
  const baseTableRows = [
    { id: "row-1", name: "Alex", role: "Admin", status: "Active" },
    { id: "row-2", name: "Jamie", role: "Editor", status: "Invited" },
    { id: "row-3", name: "Taylor", role: "Viewer", status: "Inactive" },
  ];
  const tableRows = [...baseTableRows].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];
    if (aValue === bValue) {
      return 0;
    }
    const order = aValue > bValue ? 1 : -1;
    return sortDirection === "asc" ? order : -order;
  });
  const normalizedQuery = tableQuery.trim().toLowerCase();
  const activeStatusFilters = tableFilters.includes("all")
    ? []
    : tableFilters;
  const filteredTableRows = tableRows.filter((row) => {
    const matchesQuery =
      !normalizedQuery ||
      row.name.toLowerCase().includes(normalizedQuery) ||
      row.role.toLowerCase().includes(normalizedQuery) ||
      row.status.toLowerCase().includes(normalizedQuery);
    const matchesStatus =
      activeStatusFilters.length === 0 ||
      activeStatusFilters.includes(row.status.toLowerCase());
    return matchesQuery && matchesStatus;
  });
  const formatCurrency = (value: string) =>
    value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const formattedBudget = formatCurrency(budgetRaw);

  useEffect(() => {
    if (!pauseToastStack) {
      setShowPauseBadge(false);
      return;
    }
    setShowPauseBadge(true);
    const timer = window.setTimeout(() => {
      setShowPauseBadge(false);
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [pauseToastStack]);

  useEffect(() => {
    let active = true;

    getHealth()
      .then((data) => {
        if (active) {
          setHealthStatus(data.status);
        }
      })
      .catch(() => {
        if (active) {
          setHealthError("헬스 체크 실패");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      setToastStack((prev) => (prev.length > 0 ? prev.slice(1) : prev));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSortChange = (key: "id" | "name" | "role" | "status", direction: "asc" | "desc") => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const handleTableReset = () => {
    setTableResetKey((prev) => prev + 1);
    setTableResetAnnouncement("컬럼 너비가 초기화되었습니다.");
    if (resetAnnounceTimerRef.current) {
      window.clearTimeout(resetAnnounceTimerRef.current);
    }
    resetAnnounceTimerRef.current = window.setTimeout(() => {
      setTableResetAnnouncement("");
    }, 1500);
  };

  const pushToast = (variant: "success" | "info" | "warning" | "error") => {
    const labels = {
      success: "성공",
      info: "안내",
      warning: "주의",
      error: "오류",
    } as const;
    setToastStack((prev) =>
      [
        {
          id: Date.now(),
          title: `${labels[variant]} 토스트`,
          description: "스택에 추가된 알림입니다.",
          variant,
          autoDismissMs: 2500,
        },
        ...prev,
      ].slice(0, maxToastCount),
    );
  };
  const dashboardNavItems = [
    { label: "Overview", href: "#overview" },
    { label: "Projects", href: "#projects" },
    { label: "Analytics", href: "#analytics" },
    { label: "Settings", href: "#settings" },
  ];
  const filteredDashboardTasks =
    dashboardFilter === "all"
      ? dashboardTaskState
      : dashboardTaskState.filter((task) => task.owner === "me");
  const statusFilteredTasks =
    dashboardStatusFilter === "all"
      ? filteredDashboardTasks
      : filteredDashboardTasks.filter((task) => task.status === dashboardStatusFilter);
  const tagFilteredTasks =
    dashboardTagFilters.length === 0
      ? statusFilteredTasks
      : statusFilteredTasks.filter((task) =>
          dashboardTagFilters.every((tag) => task.tags.includes(tag)),
        );
  const normalizedDashboardQuery = dashboardQuery.trim().toLowerCase();
  const searchedDashboardTasks = normalizedDashboardQuery
    ? tagFilteredTasks.filter((task) =>
        task.title.toLowerCase().includes(normalizedDashboardQuery),
      )
    : tagFilteredTasks;
  const statusPriority: Record<string, number> = { 완료: 3, 진행중: 2, 대기: 1 };
  const sortedDashboardTasks = [...searchedDashboardTasks].sort((a, b) => {
    if (dashboardSort === "title") {
      return a.title.localeCompare(b.title);
    }
    return (statusPriority[b.status] ?? 0) - (statusPriority[a.status] ?? 0);
  });
  const authEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail);
  const authPasswordStrength =
    authPassword.length >= 10 ? "강함" : authPassword.length >= 6 ? "보통" : "약함";
  const authStrengthValue =
    authPassword.length >= 10 ? 100 : authPassword.length >= 6 ? 60 : authPassword.length ? 30 : 0;
  const passwordRules = [
    { id: "len", label: "6자 이상", ok: authPassword.length >= 6 },
    { id: "num", label: "숫자 포함", ok: /\d/.test(authPassword) },
    { id: "mix", label: "영문 포함", ok: /[a-zA-Z]/.test(authPassword) },
  ];
  const authPasswordStatus =
    authPassword.length === 0
      ? "default"
      : authPassword.length >= 10
      ? "success"
      : authPassword.length >= 6
      ? "warning"
      : "error";
  const authEmailError =
    authAttempted || authEmailTouched
      ? authEmail
        ? authEmailValid
          ? undefined
          : "이메일 형식이 올바르지 않습니다."
        : "이메일을 입력하세요."
      : undefined;
  const authPasswordError =
    authAttempted || authPasswordTouched ? (!authPassword ? "비밀번호를 입력하세요." : undefined) : undefined;
  const authCanSubmit = authEmailValid && authPassword.length >= 6 && authAgreeTerms;
  const landingEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(landingEmail);
  const landingEmailError =
    landingEmailAttempted || landingEmailTouched
      ? landingEmail
        ? landingEmailValid
          ? undefined
          : "이메일 형식을 확인하세요."
        : "이메일을 입력하세요."
      : undefined;
  const dashboardActiveFilters = [
    dashboardFilter === "all" ? null : "내 작업",
    dashboardStatusFilter === "all" ? null : dashboardStatusFilter,
    dashboardQuery ? `검색: ${dashboardQuery}` : null,
    ...dashboardTagFilters.map((tag) => `#${tag}`),
  ].filter(Boolean) as string[];
  const activeDashboardFilterCount =
    (dashboardFilter === "all" ? 0 : 1) +
    (dashboardStatusFilter === "all" ? 0 : 1) +
    (dashboardQuery ? 1 : 0);
  const applyEmailDomain = (domain: string) => {
    const localPart = authEmail.split("@")[0] || "";
    const next = localPart ? `${localPart}@${domain}` : `user@${domain}`;
    setAuthEmailTouched(true);
    setAuthEmail(next);
  };
  const highlightQuery = (text: string) => {
    if (!normalizedDashboardQuery) {
      return text;
    }
    const index = text.toLowerCase().indexOf(normalizedDashboardQuery);
    if (index === -1) {
      return text;
    }
    return (
      <>
        {text.slice(0, index)}
        <mark className="rounded bg-warning-100 px-1">{text.slice(index, index + normalizedDashboardQuery.length)}</mark>
        {text.slice(index + normalizedDashboardQuery.length)}
      </>
    );
  };
  const handleAuthSubmit = () => {
    setAuthAttempted(true);
    if (authCanSubmit) {
      toast({
        title: "로그인 성공",
        description: "대시보드로 이동합니다.",
        variant: "success",
      });
      return;
    }
    toast({
      title: "입력 확인",
      description: "필수 항목을 확인해 주세요.",
      variant: "warning",
    });
  };
  const pushLandingEvent = (message: string) => {
    setLandingEventLog((prev) => [`${new Date().toLocaleTimeString()} · ${message}`, ...prev].slice(0, 5));
  };
  const saveDashboardPreset = () => {
    const presetName = dashboardPresetName.trim();
    if (!presetName) {
      setDashboardPresetError("프리셋 이름을 입력하세요.");
      return;
    }
    const duplicate = dashboardPresets.some(
      (preset) => preset.label.toLowerCase() === presetName.toLowerCase(),
    );
    if (duplicate) {
      setDashboardPresetError("이미 동일한 이름의 프리셋이 있습니다.");
      return;
    }
    const id = `preset-${Date.now()}`;
    setDashboardActivePresetId(id);
    setDashboardPresets((prev) => [
      {
        id,
        label: presetName,
        filter: dashboardFilter,
        status: dashboardStatusFilter,
        query: dashboardQuery,
        tags: dashboardTagFilters,
      },
      ...prev,
    ]);
    setDashboardPresetName("");
    setDashboardPresetError(null);
  };

  return (
    <main
      className={`min-h-screen ${isDark ? "dark bg-neutral-900 text-neutral-50" : "bg-neutral-50"}`}
    >
      <PageHeader
        title="Design System"
        subtitle="컴포넌트 프리뷰와 토큰 확인"
        actions={<Button size="sm">Publish</Button>}
      />
      <div className="px-4 py-6 sm:px-8">
        <Container className="space-y-6">
        <header className="space-y-2">
          <p className="text-sm font-semibold text-secondary-500">Design System</p>
          <h1 className="text-3xl font-bold text-neutral-900">Frontend Ready</h1>
          <p className="text-neutral-600">Next.js App Router 초기화 완료.</p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="UI 스캐폴딩" description="components 폴더 초기화됨">
            <ExampleCard title="ExampleCard" description="Tailwind 적용됨" />
          </Card>
          <Card
            title="Backend Health"
            description={healthError ?? `status: ${healthStatus}`}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <UiCard>
            <UiCardHeader>
              <UiCardTitle>Shadcn UI</UiCardTitle>
              <UiCardDescription>새로 추가한 기본 컴포넌트 미리보기</UiCardDescription>
            </UiCardHeader>
            <UiCardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <UiButton variant="primary">Primary</UiButton>
                <UiButton variant="secondary">Secondary</UiButton>
                <UiButton variant="ghost">Ghost</UiButton>
                <UiButton variant="danger">Danger</UiButton>
              </div>
              <div className="space-y-2">
                <UiInput placeholder="텍스트 입력" aria-label="텍스트 입력" />
                <UiTextarea placeholder="메모 입력" aria-label="메모 입력" />
                <FileInput aria-label="파일 업로드" />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <UiSpinner size="sm" label="로딩" />
                <UiProgress value={uiProgressValue} className="w-40" />
                <UiButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setUiProgressValue((prev) => (prev + 15 > 100 ? 0 : prev + 15))}
                >
                  진행 +15
                </UiButton>
              </div>
            </UiCardContent>
          </UiCard>
          <UiCard>
            <UiCardHeader>
              <UiCardTitle>Interactions</UiCardTitle>
              <UiCardDescription>Tabs, Dropdown, Dialog, Toast</UiCardDescription>
            </UiCardHeader>
            <UiCardContent className="space-y-4">
              <UiTabs value={uiTabValue} onValueChange={setUiTabValue}>
                <UiTabsList>
                  <UiTabsTrigger value="account">Account</UiTabsTrigger>
                  <UiTabsTrigger value="billing">Billing</UiTabsTrigger>
                </UiTabsList>
                <UiTabsContent value="account">
                  <p className="text-sm text-neutral-600">프로필 설정을 업데이트하세요.</p>
                </UiTabsContent>
                <UiTabsContent value="billing">
                  <p className="text-sm text-neutral-600">결제 수단을 관리하세요.</p>
                </UiTabsContent>
              </UiTabs>
              <div className="flex flex-wrap items-center gap-3">
                <UiDropdownMenu>
                  <UiDropdownMenuTrigger className="rounded-md border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800">
                    메뉴 열기
                  </UiDropdownMenuTrigger>
                  <UiDropdownMenuContent align="start">
                    <UiDropdownMenuLabel>빠른 작업</UiDropdownMenuLabel>
                    <UiDropdownMenuItem>프로필 보기</UiDropdownMenuItem>
                    <UiDropdownMenuItem>알림 설정</UiDropdownMenuItem>
                    <UiDropdownMenuSeparator />
                    <UiDropdownMenuItem>로그아웃</UiDropdownMenuItem>
                  </UiDropdownMenuContent>
                </UiDropdownMenu>
                <UiAvatar size="sm">
                  <UiAvatarFallback>JK</UiAvatarFallback>
                </UiAvatar>
              </div>
            </UiCardContent>
            <UiCardFooter className="flex flex-wrap gap-2">
              <Dialog open={uiDialogOpen} onOpenChange={setUiDialogOpen}>
                <DialogTrigger className="rounded-md bg-primary-500 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700">
                  Dialog 열기
                </DialogTrigger>
                <DialogContent ariaLabel="샘플 다이얼로그">
                  <DialogHeader>
                    <DialogTitle>변경 사항 확인</DialogTitle>
                    <DialogDescription>저장하기 전에 내용을 확인하세요.</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose className="rounded-md border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800">
                      닫기
                    </DialogClose>
                    <UiButton
                      variant="primary"
                      onClick={() => {
                        toast({
                          title: "저장 완료",
                          description: "변경 사항이 저장되었습니다.",
                          variant: "success",
                        });
                        setUiDialogOpen(false);
                      }}
                    >
                      저장하기
                    </UiButton>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <UiButton
                variant="secondary"
                onClick={() =>
                  toast({
                    title: "알림 전송",
                    description: "새 메시지가 도착했습니다.",
                    variant: "default",
                  })
                }
              >
                Toast 보내기
              </UiButton>
            </UiCardFooter>
          </UiCard>
        </div>

        <Card title="Layouts" description="Auth / Dashboard / Landing 미리보기">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <Text variant="caption" tone="subtle">
                AuthLayout
              </Text>
              <div className="h-[420px] overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <div className="w-[140%] origin-top-left scale-[0.7]">
                  <AuthLayout
                    title="로그인"
                    subtitle="계정 정보를 입력해 주세요."
                    footerSlot={<span>계정이 없나요? 회원가입</span>}
                  >
                    <div className="space-y-4">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toast({
                              title: "소셜 로그인",
                              description: "Google 인증을 시작합니다.",
                              variant: "info",
                            })
                          }
                        >
                          Google로 시작
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toast({
                              title: "소셜 로그인",
                              description: "GitHub 인증을 시작합니다.",
                              variant: "info",
                            })
                          }
                        >
                          GitHub로 시작
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <span className="h-px flex-1 bg-neutral-200" />
                        또는 이메일로
                        <span className="h-px flex-1 bg-neutral-200" />
                      </div>
                      <InputField
                        label="이메일"
                        placeholder="name@example.com"
                        list="auth-email-domains"
                        value={authEmail}
                        onChange={(event) => {
                          setAuthEmailTouched(true);
                          setAuthEmail(event.target.value);
                        }}
                        onBlur={() => {
                          if (authEmail && !authEmail.includes("@")) {
                            applyEmailDomain("company.com");
                          }
                        }}
                        errorText={authEmailError}
                        helperText={!authEmailError ? "회사 이메일을 권장합니다." : undefined}
                      />
                      {authEmail && !authEmail.includes("@") ? (
                        <p className="text-xs text-neutral-500">
                          @가 빠져 있어요. 포커스가 이동하면 @company.com을 자동으로 붙입니다.
                        </p>
                      ) : null}
                      <datalist id="auth-email-domains">
                        <option value="user@gmail.com" />
                        <option value="user@naver.com" />
                        <option value="user@company.com" />
                      </datalist>
                      <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
                        <span className="text-neutral-400">도메인 추천:</span>
                        {["gmail.com", "naver.com", "company.com"].map((domain) => (
                          <button
                            key={domain}
                            type="button"
                            className="rounded-full bg-neutral-100 px-2 py-1"
                            onClick={() => applyEmailDomain(domain)}
                          >
                            @{domain}
                          </button>
                        ))}
                      </div>
                      <InputField
                        label="비밀번호"
                        type={authShowPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={(event) => {
                          setAuthPasswordTouched(true);
                          setAuthPassword(event.target.value);
                        }}
                        onKeyUp={(event) => setAuthCapsLock(event.getModifierState("CapsLock"))}
                        onBlur={() => setAuthCapsLock(false)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            handleAuthSubmit();
                          }
                        }}
                        errorText={authPasswordError}
                        status={!authPasswordError ? authPasswordStatus : "error"}
                        helperText={
                          !authPasswordError
                            ? authPassword.length
                              ? `비밀번호 강도: ${authPasswordStrength}`
                              : "영문/숫자 조합 6자 이상"
                            : undefined
                        }
                        actionSlot={
                          <button
                            type="button"
                            className="rounded px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100"
                            onClick={() => setAuthShowPassword((prev) => !prev)}
                          >
                            {authShowPassword ? "숨김" : "표시"}
                          </button>
                        }
                      />
                      <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-200">
                        <div
                          className={`h-full rounded-full ${
                            authPasswordStatus === "success"
                              ? "bg-success-500"
                              : authPasswordStatus === "warning"
                              ? "bg-warning-500"
                              : authPasswordStatus === "error"
                              ? "bg-error-500"
                              : "bg-neutral-300"
                          }`}
                          style={{ width: `${authStrengthValue}%` }}
                        />
                      </div>
                      {authCapsLock ? (
                        <p className="text-xs text-warning-600">Caps Lock이 켜져 있습니다.</p>
                      ) : null}
                      <div className="grid gap-2 text-xs text-neutral-500 sm:grid-cols-3">
                        {passwordRules.map((rule) => (
                          <div
                            key={rule.id}
                            className={`rounded-md px-2 py-1 ${
                              rule.ok ? "bg-success-50 text-success-600" : "bg-neutral-100"
                            }`}
                          >
                            {rule.ok ? "✓" : "•"} {rule.label}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="h-3 w-3"
                            checked={authRemember}
                            onChange={(event) => setAuthRemember(event.target.checked)}
                          />
                          로그인 유지
                        </label>
                        <button type="button" className="text-primary-500 hover:text-primary-600">
                          비밀번호 찾기
                        </button>
                      </div>
                      <label className="flex items-center gap-2 text-xs text-neutral-500">
                        <input
                          type="checkbox"
                          className="h-3 w-3"
                          checked={authAgreeTerms}
                          onChange={(event) => setAuthAgreeTerms(event.target.checked)}
                        />
                        이용약관 및 개인정보 처리방침 동의
                      </label>
                      <Button size="sm" disabled={!authCanSubmit} onClick={handleAuthSubmit}>
                        로그인
                      </Button>
                      <p className="text-xs text-neutral-400">
                        로그인 시 이용약관 및 개인정보 처리방침에 동의합니다.
                      </p>
                    </div>
                  </AuthLayout>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Text variant="caption" tone="subtle">
                DashboardLayout
              </Text>
              <div className="h-[420px] overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <div className="w-[140%] origin-top-left scale-[0.7]">
                  <DashboardLayout
                    title="Workspace"
                    navItems={dashboardNavItems}
                    notificationSlot={
                      <button
                        className="rounded-md p-2 text-sm text-neutral-500 hover:bg-neutral-100"
                        aria-label="알림"
                        onClick={() => setDashboardNotifications(0)}
                      >
                        <span className="relative inline-flex">
                          🔔
                          {dashboardNotifications > 0 ? (
                            <span className="absolute -right-2 -top-1 rounded-full bg-error-500 px-1 text-[10px] text-white">
                              {dashboardNotifications}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    }
                    userMenuSlot={
                      <button
                        className="rounded-full border border-neutral-200 px-3 py-1 text-xs"
                        aria-label="사용자 메뉴"
                      >
                        Jinha
                      </button>
                    }
                  >
                    <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-3">
                        {[
                          { title: "활성 사용자", value: "1,248", delta: "+12%" },
                          { title: "프로젝트", value: "26", delta: "+3" },
                          { title: "자동화", value: "84%", delta: "+4%" },
                        ].map((item) => (
                          <div
                            key={item.title}
                            className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
                          >
                            <p className="text-xs text-neutral-500">{item.title}</p>
                            <p className="mt-2 text-lg font-semibold">{item.value}</p>
                            <p className="mt-1 text-xs text-success-500">{item.delta}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-neutral-500">정렬:</span>
                        <button
                          type="button"
                          className={`rounded-full px-3 py-1 ${
                            dashboardSort === "status" ? "bg-primary-500 text-white" : "bg-neutral-100"
                          }`}
                          onClick={() => setDashboardSort("status")}
                        >
                          상태
                        </button>
                        <button
                          type="button"
                          className={`rounded-full px-3 py-1 ${
                            dashboardSort === "title" ? "bg-primary-500 text-white" : "bg-neutral-100"
                          }`}
                          onClick={() => setDashboardSort("title")}
                        >
                          이름
                        </button>
                        <button
                          type="button"
                          className={`rounded-full px-3 py-1 ${
                            dashboardFilter === "all" ? "bg-primary-500 text-white" : "bg-neutral-100"
                          }`}
                          onClick={() => setDashboardFilter("all")}
                        >
                          전체
                        </button>
                        <button
                          type="button"
                          className={`rounded-full px-3 py-1 ${
                            dashboardFilter === "mine" ? "bg-primary-500 text-white" : "bg-neutral-100"
                          }`}
                          onClick={() => setDashboardFilter("mine")}
                        >
                          내 작업
                        </button>
                        <span className="text-neutral-400">
                          활성 필터 {activeDashboardFilterCount}개
                        </span>
                        <button
                          type="button"
                          className="rounded-full border border-neutral-200 px-3 py-1 text-neutral-500"
                          onClick={() => {
                            setDashboardFilter("all");
                            setDashboardStatusFilter("all");
                            setDashboardQuery("");
                            setDashboardTagFilters([]);
                          }}
                        >
                          초기화
                        </button>
                        <button
                          type="button"
                          className={`rounded-full px-3 py-1 ${
                            dashboardStatusFilter === "all"
                              ? "bg-primary-500 text-white"
                              : "bg-neutral-100"
                          }`}
                          onClick={() => setDashboardStatusFilter("all")}
                        >
                          전체 상태
                        </button>
                        {(["대기", "진행중", "완료"] as const).map((status) => (
                          <button
                            key={status}
                            type="button"
                            className={`rounded-full px-3 py-1 ${
                              dashboardStatusFilter === status
                                ? "bg-primary-500 text-white"
                                : "bg-neutral-100"
                            }`}
                            onClick={() => setDashboardStatusFilter(status)}
                          >
                            {status}
                          </button>
                        ))}
                        <input
                          type="search"
                          value={dashboardQuery}
                          onChange={(event) => setDashboardQuery(event.target.value)}
                          placeholder="작업 검색"
                          className="rounded-full border border-neutral-200 px-3 py-1 text-xs"
                        />
                        <button
                          type="button"
                          className="rounded-full bg-secondary-500 px-3 py-1 text-white"
                          onClick={() => {
                            const nextId = `task-${Date.now()}`;
                            setDashboardTaskState((prev) => [
                              {
                                id: nextId,
                                title: "신규 요청",
                                owner: "me",
                                status: "대기",
                                tags: ["new"],
                              },
                              ...prev,
                            ]);
                            setDashboardNotifications((prev) => prev + 1);
                          }}
                        >
                          새 작업
                        </button>
                      </div>
                      {dashboardActiveFilters.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
                          <span className="text-neutral-400">적용 중:</span>
                          {dashboardActiveFilters.map((filter) => (
                            <span
                              key={filter}
                              className="rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-600"
                            >
                              {filter}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-neutral-400">적용 중인 필터가 없습니다.</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <input
                          type="text"
                          value={dashboardPresetName}
                          onChange={(event) => {
                            setDashboardPresetName(event.target.value);
                            setDashboardPresetError(null);
                          }}
                          placeholder="프리셋 이름"
                          className="rounded-md border border-neutral-200 px-2 py-1 text-xs"
                        />
                        <button
                          type="button"
                          className="rounded-md bg-neutral-900 px-3 py-1 text-xs text-white"
                          onClick={saveDashboardPreset}
                        >
                          프리셋 저장
                        </button>
                        {dashboardActivePresetId ? (
                          <>
                            <button
                              type="button"
                              className="rounded-md border border-neutral-200 px-3 py-1 text-xs text-neutral-600"
                              onClick={() =>
                                setDashboardPresets((prev) =>
                                  prev.map((preset) =>
                                    preset.id === dashboardActivePresetId
                                      ? {
                                          ...preset,
                                          filter: dashboardFilter,
                                          status: dashboardStatusFilter,
                                          query: dashboardQuery,
                                          tags: dashboardTagFilters,
                                        }
                                      : preset,
                                  ),
                                )
                              }
                            >
                              덮어쓰기
                            </button>
                            <button
                              type="button"
                              className="rounded-md border border-neutral-200 px-3 py-1 text-xs text-neutral-600"
                              onClick={() => {
                                const presetName = dashboardPresetName.trim();
                                if (!presetName) {
                                  setDashboardPresetError("새 이름을 입력하세요.");
                                  return;
                                }
                                const duplicate = dashboardPresets.some(
                                  (preset) =>
                                    preset.label.toLowerCase() === presetName.toLowerCase() &&
                                    preset.id !== dashboardActivePresetId,
                                );
                                if (duplicate) {
                                  setDashboardPresetError("이미 동일한 이름의 프리셋이 있습니다.");
                                  return;
                                }
                                setDashboardPresets((prev) =>
                                  prev.map((preset) =>
                                    preset.id === dashboardActivePresetId
                                      ? { ...preset, label: presetName }
                                      : preset,
                                  ),
                                );
                                setDashboardPresetName("");
                                setDashboardPresetError(null);
                              }}
                            >
                              이름 변경
                            </button>
                          </>
                        ) : null}
                        {dashboardPresets.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {dashboardPresets.map((preset) => (
                              <div key={preset.id} className="flex items-center gap-1">
                                <button
                                  type="button"
                                  className={`rounded-full border px-3 py-1 text-xs ${
                                    dashboardActivePresetId === preset.id
                                      ? "border-primary-500 bg-primary-50 text-primary-700"
                                      : "border-neutral-200 text-neutral-600"
                                  }`}
                                  onClick={() => {
                                    setDashboardFilter(preset.filter);
                                    setDashboardStatusFilter(preset.status);
                                    setDashboardQuery(preset.query);
                                    setDashboardTagFilters(preset.tags);
                                    setDashboardActivePresetId(preset.id);
                                  }}
                                >
                                  {preset.label}
                                </button>
                                <button
                                  type="button"
                                  className="rounded-full border border-neutral-200 px-2 py-0.5 text-[10px] text-neutral-500"
                                  aria-label={`${preset.label} 삭제`}
                                  onClick={() => {
                                    setDashboardPresets((prev) =>
                                      prev.filter((item) => item.id !== preset.id),
                                    );
                                    setDashboardActivePresetId((prev) =>
                                      prev === preset.id ? null : prev,
                                    );
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      {dashboardPresetError ? (
                        <p className="text-xs text-error-500">{dashboardPresetError}</p>
                      ) : null}
                      <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
                        {["design", "review", "release", "docs", "new"].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            className={`rounded-full px-3 py-1 ${
                              dashboardTagFilters.includes(tag)
                                ? "bg-secondary-500 text-white"
                                : "bg-neutral-100"
                            }`}
                            onClick={() =>
                              setDashboardTagFilters((prev) =>
                                prev.includes(tag)
                                  ? prev.filter((item) => item !== tag)
                                  : [...prev, tag],
                              )
                            }
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
                          <p className="text-sm font-semibold">오늘의 작업</p>
                          <div className="mt-3 space-y-2 text-xs text-neutral-500">
                            {sortedDashboardTasks.length === 0 ? (
                              <div className="rounded-md border border-dashed border-neutral-200 p-3 text-center text-xs text-neutral-400">
                                조건에 맞는 작업이 없습니다.
                              </div>
                            ) : null}
                            {sortedDashboardTasks.map((task) => (
                              <div key={task.id} className="flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  className="flex items-center gap-2 text-left"
                                  onClick={() =>
                                    setDashboardTaskState((prev) =>
                                      prev.map((item) =>
                                        item.id === task.id
                                          ? {
                                              ...item,
                                              status:
                                                item.status === "완료"
                                                  ? "진행중"
                                                  : item.status === "진행중"
                                                  ? "대기"
                                                  : "완료",
                                            }
                                          : item,
                                      ),
                                    )
                                  }
                                >
                                  <span
                                    className={`h-2 w-2 rounded-full ${
                                      task.status === "완료"
                                        ? "bg-success-500"
                                        : task.status === "진행중"
                                        ? "bg-warning-500"
                                        : "bg-neutral-300"
                                    }`}
                                  />
                                  <span>{highlightQuery(task.title)}</span>
                                  <span className="flex flex-wrap gap-1 text-[10px] text-neutral-400">
                                    {task.tags.map((tag) => (
                                      <span key={tag} className="rounded-full bg-neutral-100 px-2 py-0.5">
                                        #{tag}
                                      </span>
                                    ))}
                                  </span>
                                </button>
                                <span>{task.status}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
                          <p className="text-sm font-semibold">최근 알림</p>
                          <ul className="mt-3 space-y-2 text-xs text-neutral-500">
                            <li>새 메시지 3개</li>
                            <li>빌드 성공 알림</li>
                            <li>팀 멤버 초대 완료</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </DashboardLayout>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Text variant="caption" tone="subtle">
                LandingLayout
              </Text>
              <div className="h-[420px] overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <div className="w-[140%] origin-top-left scale-[0.7]">
                  <LandingLayout
                    hero={
                      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="space-y-4">
                          <p className="text-sm font-semibold text-secondary-500">Launch faster</p>
                          <h2 className="text-3xl font-bold">AI 기반 워크플로우</h2>
                          <p className="text-sm text-neutral-600">
                            팀 협업과 자동화를 한 번에 관리하세요. 3분 만에 세팅하고 바로 배포합니다.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                toast({
                                  title: "무료 시작",
                                  description: "온보딩 플로우로 이동합니다.",
                                  variant: "success",
                                })
                              }
                              onMouseDown={() => pushLandingEvent("무료 시작 클릭")}
                            >
                              무료 시작
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                toast({
                                  title: "데모 예약",
                                  description: "데모 일정 페이지를 준비 중입니다.",
                                  variant: "info",
                                })
                              }
                              onMouseDown={() => pushLandingEvent("데모 보기 클릭")}
                            >
                              데모 보기
                            </Button>
                          </div>
                      {landingEventLog[0] ? (
                        <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-600">
                          <span className="h-2 w-2 rounded-full bg-success-500" />
                          {landingEventLog[0]}
                        </div>
                      ) : null}
                          <div className="flex flex-wrap gap-4 text-xs text-neutral-500">
                            <span>✓ 5분 온보딩</span>
                            <span>✓ SLA 99.9%</span>
                            <span>✓ 보안 인증</span>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                          <p className="text-xs text-neutral-500">이번 주 하이라이트</p>
                          <p className="mt-2 text-xl font-semibold">+28% 전환율</p>
                          <div className="mt-4 space-y-2 text-xs text-neutral-500">
                            <div className="flex items-center justify-between">
                              <span>신규 리드</span>
                              <span>128</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>자동화 실행</span>
                              <span>412</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>오류율</span>
                              <span>0.8%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                    features={
                      <>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {[
                            { title: "빠른 설정", desc: "템플릿으로 10분 내 시작" },
                            { title: "보안", desc: "권한/로그/감사 추적" },
                            { title: "분석 대시보드", desc: "실시간 KPI 시각화" },
                            { title: "자동화", desc: "반복 작업 자동화" },
                          ].map((item) => (
                            <div
                              key={item.title}
                              className="rounded-xl border border-neutral-200 bg-white p-4 text-sm shadow-sm"
                            >
                              <p className="font-semibold">{item.title}</p>
                              <p className="mt-2 text-xs text-neutral-500">{item.desc}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-6 space-y-2">
                          <p className="text-sm font-semibold">자주 묻는 질문</p>
                          <Accordion
                            items={[
                              {
                                id: "faq-1",
                                title: "무료 플랜으로 시작할 수 있나요?",
                                content: "네, Starter 플랜으로 기본 기능을 이용할 수 있습니다.",
                              },
                              {
                                id: "faq-2",
                                title: "데이터는 어디에 저장되나요?",
                                content: "리전별 보안 스토리지에 암호화되어 저장됩니다.",
                              },
                              {
                                id: "faq-3",
                                title: "팀 규모 제한이 있나요?",
                                content: "Pro 플랜에서는 팀 규모 제한이 없습니다.",
                              },
                            ]}
                            openId={landingFaqOpen}
                            onChange={setLandingFaqOpen}
                          />
                        </div>
                      </>
                    }
                    pricing={
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs">
                          <button
                            type="button"
                            className={`rounded-full px-3 py-1 ${
                              landingBilling === "monthly"
                                ? "bg-primary-500 text-white"
                                : "bg-neutral-100"
                            }`}
                            onClick={() => setLandingBilling("monthly")}
                          >
                            월간
                          </button>
                          <button
                            type="button"
                            className={`rounded-full px-3 py-1 ${
                              landingBilling === "yearly"
                                ? "bg-primary-500 text-white"
                                : "bg-neutral-100"
                            }`}
                            onClick={() => {
                              setLandingBilling("yearly");
                              pushLandingEvent("연간 요금제 선택");
                            }}
                          >
                            연간 (20% 할인)
                          </button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-xl border border-neutral-200 bg-white p-4">
                            <p className="text-sm font-semibold">Starter</p>
                            <p className="mt-2 text-xs text-neutral-500">
                              {landingBilling === "yearly" ? "연 0원" : "월 0원"}
                            </p>
                            <ul className="mt-3 space-y-1 text-xs text-neutral-500">
                              <li>기본 자동화</li>
                              <li>팀원 3명</li>
                              <li>커뮤니티 지원</li>
                            </ul>
                          </div>
                          <div className="rounded-xl border border-primary-200 bg-primary-50 p-4">
                            <p className="text-sm font-semibold">Pro</p>
                            <p className="mt-2 text-xs text-neutral-500">
                              {landingBilling === "yearly" ? "월 23,000원" : "월 29,000원"}
                            </p>
                            <ul className="mt-3 space-y-1 text-xs text-neutral-500">
                              <li>고급 자동화</li>
                              <li>무제한 팀</li>
                              <li>전담 지원</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    }
                    footer={
                      <div className="space-y-3 text-xs text-neutral-500">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span>© 2026 Freeshell</span>
                          <span>privacy · terms · contact</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="email"
                            value={landingEmail}
                            onChange={(event) => {
                              setLandingEmailTouched(true);
                              setLandingEmail(event.target.value);
                              setLandingSubscribed(false);
                            }}
                            placeholder="이메일로 업데이트 받기"
                            className={`min-w-[200px] flex-1 rounded-md border px-3 py-2 text-xs ${
                              landingEmailError
                                ? "border-error-500"
                                : landingSubscribed
                                ? "border-success-500"
                                : "border-neutral-200"
                            }`}
                          />
                          <button
                            type="button"
                            className={`rounded-md px-3 py-2 text-xs text-white ${
                              landingSubscribed ? "bg-success-500" : "bg-primary-500"
                            }`}
                            onClick={() => {
                              setLandingEmailAttempted(true);
                              if (landingEmailValid) {
                                toast({
                                  title: "구독 완료",
                                  description: "뉴스레터 신청이 완료되었습니다.",
                                  variant: "success",
                                });
                                pushLandingEvent("뉴스레터 구독 완료");
                                setLandingEmail("");
                                setLandingEmailTouched(false);
                                setLandingEmailAttempted(false);
                                setLandingSubscribed(true);
                              } else {
                                toast({
                                  title: "입력 확인",
                                  description: "이메일을 확인해 주세요.",
                                  variant: "warning",
                                });
                              }
                            }}
                          >
                            {landingSubscribed ? "구독 완료" : "구독"}
                          </button>
                        </div>
                        {landingEmailError ? <p className="text-error-500">{landingEmailError}</p> : null}
                        {landingSubscribed && !landingEmailError ? (
                          <p className="text-success-500">구독이 완료되었습니다.</p>
                        ) : null}
                        {landingEventLog.length > 0 ? (
                          <div className="rounded-lg border border-neutral-200 bg-white p-3 text-[11px] text-neutral-500">
                            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-neutral-600">
                              <span>최근 활동</span>
                              <button
                                type="button"
                                className="rounded-full border border-neutral-200 px-2 py-0.5 text-[10px] text-neutral-500"
                                onClick={() => setLandingEventLog([])}
                              >
                                기록 지우기
                              </button>
                            </div>
                            <ul className="space-y-1">
                              {landingEventLog.map((event) => (
                                <li key={event}>{event}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Theme Toggle" description="라이트 / 다크 전환">
            <div className="space-y-3">
              <ThemeToggle isDark={isDark} onChange={setIsDark} />
              <div className="rounded-md border border-dashed border-neutral-200 p-3 dark:border-neutral-700">
                <Text variant="subheading" tone="default" weight="semibold">
                  다크 모드 타이포
                </Text>
                <Text variant="body" tone="muted">
                  배경과 대비되는 텍스트 스타일을 확인하세요.
                </Text>
              </div>
            </div>
          </Card>
          <Card title="Form Validation" description="에러 상태 예시">
            <div className="space-y-4">
              <InputField
                label="이메일"
                placeholder="name@example.com"
                errorText="올바른 이메일을 입력하세요."
                required
              />
              <ValidationMessage message="이메일 형식이 올바르지 않습니다." variant="error" />
              <InputField
                label="닉네임"
                placeholder="jinha"
                helperText="사용 가능한 닉네임입니다."
                status="success"
              />
              <SelectField
                label="경고 플랜"
                options={[
                  { label: "선택하세요", value: "" },
                  { label: "Starter", value: "starter" },
                  { label: "Basic", value: "basic" },
                ]}
                helperText="기본 옵션은 제한이 있습니다."
                status="warning"
              />
              <SelectField
                label="플랜"
                options={[
                  { label: "선택하세요", value: "" },
                  { label: "Starter", value: "starter" },
                  { label: "Pro", value: "pro" },
                ]}
                errorText="플랜을 선택해야 합니다."
                required
              />
              <ValidationMessage message="프로 요금제로 업그레이드 가능" variant="info" />
            </div>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Breadcrumbs" description="브레드크럼">
            <Breadcrumbs items={[{ label: "Home" }, { label: "Design" }, { label: "Components" }]} />
          </Card>
          <Card title="Banner" description="상단 알림 배너">
            <div className="space-y-3">
              <Banner title="공지" description="새로운 업데이트가 있습니다." variant="info" />
              <Banner title="성공" description="배포가 완료되었습니다." variant="success" />
              <BannerAction
                title="프로모션"
                description="지금 업그레이드하면 20% 할인"
                actionLabel="업그레이드"
                onAction={() => {}}
                variant="warning"
              />
              <DismissibleBanner
                title="닫기 가능"
                description="필요 없으면 닫을 수 있어요."
                variant="info"
              />
            </div>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Active Users" value="1,240" delta="+8%" />
          <MetricCard label="Conversion" value="3.4%" delta="+0.4%" />
          <MetricCard label="Revenue" value="$12.4k" delta="+5%" />
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-neutral-900">컬러 팔레트</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            <span className="rounded-full bg-primary-500 px-3 py-1 text-sm text-white">
              Primary 500
            </span>
            <span className="rounded-full bg-primary-700 px-3 py-1 text-sm text-white">
              Primary 700
            </span>
            <span className="rounded-full bg-secondary-500 px-3 py-1 text-sm text-white">
              Secondary 500
            </span>
            <span className="rounded-full bg-secondary-700 px-3 py-1 text-sm text-white">
              Secondary 700
            </span>
            <span className="rounded-full bg-accent-500 px-3 py-1 text-sm text-white">
              Accent
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Buttons" description="Primary / Secondary / Ghost">
            <div className="flex flex-wrap gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button isLoading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button icon={<Icon symbol="★" size="sm" />}>Icon</Button>
              <Button fullWidth variant="secondary">
                Full Width
              </Button>
            </div>
          </Card>
          <Card
            title="Badges"
            description="Status colors"
            actions={<Badge label="New" variant="info" size="sm" icon={<Icon symbol="!" size="sm" />} />}
          >
            <div className="flex flex-wrap gap-2">
              <Badge label="Neutral" />
              <Badge label="Success" variant="success" />
              <Badge label="Warning" variant="warning" />
              <Badge label="Error" variant="error" />
              <Badge label="Info" variant="info" />
              <Badge label="Small" variant="neutral" size="sm" />
              <Badge
                label="Right Icon"
                variant="success"
                icon={<Icon symbol="✓" size="sm" />}
                iconPosition="right"
              />
              <Badge label="Soft" variant="info" appearance="soft" />
              <Badge label="Outline" variant="warning" appearance="outline" />
            </div>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Inputs" description="기본 입력 스타일">
            <div className="space-y-4">
              <InputField
                label="프로젝트 이름"
                placeholder="새 프로젝트"
                helperText="8자 이상 입력하세요."
                required
              />
              <InputField
                label="예산"
                prefixSlot="₩"
                placeholder="숫자만 입력"
                helperText="숫자를 입력하면 자동으로 포맷됩니다."
                value={formattedBudget}
                onChange={(event) => {
                  setBudgetRaw(event.target.value);
                }}
              />
              <SelectField
                label="타입"
                options={[
                  { label: "선택하세요", value: "" },
                  { label: "웹", value: "web" },
                  { label: "모바일", value: "mobile" },
                ]}
                errorText="타입을 선택하세요."
                required
              />
              <TextareaField
                label="설명"
                placeholder="프로젝트 설명"
                helperText="최대 200자"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={200}
                showCount
              />
              <Toggle
                label="알림 받기"
                checked={notificationsEnabled}
                onChange={setNotificationsEnabled}
              />
            </div>
          </Card>
          <Card title="Alerts" description="상태 메시지">
            <div className="space-y-3">
              <Alert
                title="Info"
                description="정보성 메시지를 표시합니다."
                variant="info"
                icon={<Icon symbol="i" size="sm" />}
              />
              <Alert
                title="Success"
                description="성공 상태를 표시합니다."
                variant="success"
                icon={<Icon symbol="✓" size="sm" />}
              />
              <Alert
                title="Warning"
                description="주의 메시지를 표시합니다."
                variant="warning"
                icon={<Icon symbol="!" size="sm" />}
              />
              <Alert
                title="Error"
                description="오류 상태를 표시합니다."
                variant="error"
                icon={<Icon symbol="×" size="sm" />}
              />
              <Alert
                title="Info Small"
                description="작은 사이즈 프리뷰"
                variant="info"
                size="sm"
                icon={<Icon symbol="i" size="sm" />}
              />
            </div>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Typography" description="Text 컴포넌트">
            <div className="space-y-2">
              <Text as="h2" variant="heading" weight="bold" tone="default">
                Heading
              </Text>
              <Text as="h3" variant="subheading" weight="semibold" tone="default">
                Subheading
              </Text>
              <Text variant="body" tone="muted">
                Body text example.
              </Text>
              <Text variant="caption" tone="subtle">
                Caption text example.
              </Text>
              <Text variant="code" tone="primary">
                const example = true;
              </Text>
            </div>
          </Card>
          <Card title="Icons" description="공용 아이콘">
            <div className="flex flex-wrap gap-3">
              <Icon symbol="★" size="sm" />
              <Icon symbol="⚙" size="md" />
              <Icon symbol="✓" size="lg" />
            </div>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="FormField Wrapper" description="공통 폼 래퍼">
            <div className="space-y-4">
              <FormField label="프로젝트 제목" helperText="필수 입력">
                <input
                  className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-500"
                  placeholder="제목을 입력하세요"
                />
              </FormField>
              <FormField label="비활성 입력" helperText="읽기 전용 예시">
                <input
                  className="w-full rounded-md border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm text-neutral-400"
                  placeholder="비활성 상태"
                  disabled
                />
              </FormField>
              <InputField
                id="project-name"
                name="projectName"
                label="프로젝트 이름"
                subLabel="간단한 설명을 함께 표시할 수 있어요."
                prefixSlot="✎"
                prefixClickable
                prefixDisabled
                prefixAriaLabel="프로젝트 이름 안내"
                onPrefixClick={() => {}}
                suffixSlot="UI"
                suffixClickable
                suffixAriaLabel="UI 표시"
                onSuffixClick={() => {}}
                suffixHoverable={false}
                placeholder="id/name 예시"
                helperText="name 속성은 폼 제출에 사용"
                helperSlot={<button className="text-primary-600">도움말</button>}
                helperSlotAlign="left"
                autoComplete="organization"
                required
                requiredBadge
                status="success"
              />
              <InputField
                label="토큰"
                placeholder="Copy/Clear 예시"
                helperText="액션 버튼과 설명이 길어질 때 줄바꿈을 확인합니다."
                helperIconSlot={<Icon symbol="i" size="sm" />}
                helperIconSize="md"
                helperIconClickable
                helperIconAriaLabel="토큰 도움말"
                onHelperIconClick={() => {}}
                helperIconColor="primary"
                helperIconTooltip="토큰 안내"
                helperWrap="wrap"
                value={tokenValue}
                onChange={(event) => setTokenValue(event.target.value)}
                clearable
                onClear={() => setTokenValue("")}
                actionSlot={
                  <>
                    <button type="button" className="rounded bg-neutral-100 px-2 py-1 text-xs">
                      복사
                    </button>
                    <button type="button" className="rounded bg-neutral-100 px-2 py-1 text-xs">
                      지우기
                    </button>
                  </>
                }
              />
              <SelectField
                label="플랜 선택"
                prefixSlot="★"
                options={[
                  { label: "Starter", value: "starter" },
                  { label: "Pro", value: "pro" },
                ]}
                helperText="권장 플랜을 확인하세요."
                status="warning"
              />
              <TextareaField
                label="설명"
                suffixSlot="i"
                placeholder="간단 설명"
                helperText="필수 입력입니다."
                status="error"
                required
              />
            </div>
          </Card>
          <Card title="Keyboard Navigation" description="키보드 내비게이션 예시">
            <ul className="list-disc space-y-2 pl-5 text-sm text-neutral-600 dark:text-neutral-300">
              <li>Tab으로 버튼/입력 포커스 이동</li>
              <li>Enter 또는 Space로 버튼 활성화</li>
              <li>Esc로 모달/드로어 닫기 권장</li>
            </ul>
          </Card>
          <Card title="Disabled States" description="Disabled UI">
            <div className="space-y-3">
              <InputField
                label="비활성 인풋"
                placeholder="입력 불가"
                disabled
              />
              <SelectField
                label="비활성 셀렉트"
                options={[{ label: "선택 불가", value: "" }]}
                disabled
              />
              <TextareaField label="비활성 텍스트" disabled />
              <Toggle label="비활성 토글" disabled />
            </div>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card
            title="Card Footer"
            description="Footer 슬롯"
            footer={
              <div className="flex items-center justify-between text-sm text-neutral-600">
                <span>Updated just now</span>
                <Button size="sm" variant="ghost">
                  View
                </Button>
              </div>
            }
          >
            <Text variant="body" tone="muted">
              Card body content goes here.
            </Text>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Tabs" description="탭 컴포넌트">
            <div className="space-y-3">
              <Tabs
                tabs={[
                  { id: "overview", label: "Overview" },
                  { id: "details", label: "Details" },
                  { id: "settings", label: "Settings" },
                ]}
                activeId={activeTab}
                onChange={setActiveTab}
              />
              <Text variant="body" tone="muted">
                Active tab: {activeTab}
              </Text>
            </div>
          </Card>
          <Card
            title="Modal"
            description="모달 컴포넌트"
            actions={
              <Button size="sm" variant="secondary" onClick={() => setIsModalOpen(true)}>
                Open
              </Button>
            }
          >
            <Text variant="body" tone="muted">
              모달은 버튼을 눌러 열 수 있어요.
            </Text>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Toast" description="토스트 컴포넌트">
            <div className="space-y-3">
              <Toast
                title="Info"
                description="기본 안내 메시지"
                variant="info"
                showIcon
                showProgress
                pauseOnHover
                showPausedAt
                pausedAtFormat="datetime"
                pausedAtFormatter={(date) => `Paused at ${date.toLocaleTimeString()}`}
                animationFrom="top"
                closeOnEsc
                autoDismissMs={4000}
              />
              <Toast
                title="Success"
                description="성공 알림"
                variant="success"
                showIcon
                showProgress
                pauseOnHover
                animationFrom="top"
                closeOnEsc
                actionLabel="Undo"
                onAction={() => {}}
                actionAlign="left"
                autoDismissMs={4000}
              />
              <Toast
                title="Warning"
                description="주의 알림"
                variant="warning"
                showIcon
                showProgress
                pauseOnHover
                animationFrom="top"
                closeOnEsc
                autoDismissMs={4000}
              />
              <Toast
                title="Error"
                description="에러 알림"
                variant="error"
                showIcon
                showProgress
                pauseOnHover
                animationFrom="top"
                closeOnEsc
                focusOnMount
                announcement="에러 알림이 표시되었습니다."
                autoDismissMs={4000}
              />
            </div>
          </Card>
          <Card title="Toast Stack" description="스택 관리 예시">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => pushToast("success")}>
                  Success
                </Button>
                <Button size="sm" variant="secondary" onClick={() => pushToast("info")}>
                  Info
                </Button>
                <Button size="sm" variant="secondary" onClick={() => pushToast("warning")}>
                  Warning
                </Button>
                <Button size="sm" variant="secondary" onClick={() => pushToast("error")}>
                  Error
                </Button>
              </div>
              <Text variant="caption" tone="subtle">
                최대 {maxToastCount}개까지 유지됩니다.
              </Text>
              <Button size="sm" variant="ghost" onClick={() => setToastStack([])}>
                전체 닫기
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setPauseToastStack((prev) => !prev)}>
                {pauseToastStack ? "스택 재개" : "스택 일시정지"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setToastRemainingBadge((prev) => !prev)}
              >
                남은 시간 배지 {toastRemainingBadge ? "끄기" : "켜기"}
              </Button>
              {showPauseBadge ? (
                <button type="button" onClick={() => setPauseToastStack((prev) => !prev)}>
                  <Badge
                    label={pauseToastStack ? "Paused" : "Running"}
                    variant={pauseToastStack ? "warning" : "success"}
                    size="sm"
                    appearance="soft"
                  />
                </button>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" onClick={() => setToastPosition("top-left")}>
                  Top Left
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setToastPosition("top-right")}>
                  Top Right
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setToastPosition("bottom-left")}>
                  Bottom Left
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setToastPosition("bottom-right")}>
                  Bottom Right
                </Button>
              </div>
              <div
                className={`relative h-48 rounded-md border border-dashed border-neutral-200 ${
                  pauseToastStack ? "bg-warning-50/60" : ""
                }`}
              >
                {toastStack.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <Text variant="caption" tone="subtle">
                      스택이 비어 있습니다.
                    </Text>
                  </div>
                ) : (
                  <ToastStack position={toastPosition} isFixed={false}>
                    {[...toastStack].map((toast) => (
                      <Toast
                        key={toast.id}
                        title={toast.title}
                        description={toast.description}
                        variant={toast.variant}
                        showIcon
                        showProgress
                        pauseOnHover
                        showPausedAt={pauseToastStack}
                        forcePause={pauseToastStack}
                        animationFrom={toastAnimationFrom}
                        closeOnEsc={false}
                        autoDismissMs={toast.autoDismissMs}
                        showRemainingBadge={toastRemainingBadge}
                        remainingBadgeFormat="mm:ss"
                        onClose={() =>
                          setToastStack((prev) => prev.filter((item) => item.id !== toast.id))
                        }
                      />
                    ))}
                  </ToastStack>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card
            title="Drawer"
            description="우측 슬라이드 패널"
            actions={
              <Button size="sm" variant="secondary" onClick={() => setIsDrawerOpen(true)}>
                Open
              </Button>
            }
          >
            <Text variant="body" tone="muted">
              Drawer는 측면에서 열립니다.
            </Text>
          </Card>
          <Card
            title="Overlay"
            description="중앙 오버레이"
            actions={
              <Button size="sm" variant="secondary" onClick={() => setIsOverlayOpen(true)}>
                Open
              </Button>
            }
          >
            <Text variant="body" tone="muted">
              Overlay는 중앙에 표시됩니다.
            </Text>
          </Card>
        </div>

        {selectedRowIds.length > 0 ? (
          <Card title="Selection Summary" description="선택 상태 요약">
            <div className="flex items-center justify-between gap-4">
              <Text variant="body" tone="muted">
                {selectedRowIds.length}개 선택됨
              </Text>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setSelectedRowIds([])}>
                  선택 해제
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setSelectedRowIds([])}>
                  일괄 작업
                </Button>
              </div>
            </div>
          </Card>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Data Table" description="정렬/빈 상태">
            <div className="space-y-3">
              <Button size="sm" variant="ghost" onClick={() => setShowEmptyTable((prev) => !prev)}>
                {showEmptyTable ? "샘플 데이터 보기" : "빈 상태 보기"}
              </Button>
              <div className="space-y-2">
                <SearchInput value={tableQuery} onChange={setTableQuery} />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setColumnOrder(["name", "role", "status"])}>
                    기본 순서
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setColumnOrder(["status", "name", "role"])}>
                    Status 먼저
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setTableDensity("comfortable")}>
                    기본 밀도
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setTableDensity("compact")}>
                    컴팩트
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleTableReset}>
                    리사이즈 초기화
                  </Button>
                </div>
                <span className="sr-only" aria-live="polite">
                  {tableResetAnnouncement}
                </span>
                <FilterChips
                  chips={[
                    { id: "name", label: "Name" },
                    { id: "role", label: "Role" },
                    { id: "status", label: "Status" },
                  ]}
                  activeIds={dataTableColumns
                    .map((column) => column.key)
                    .filter((key) => !hiddenColumns.includes(key as "name" | "role" | "status"))}
                  onToggle={(id) => {
                    setHiddenColumns((prev) => {
                      const next = prev.includes(id as "name" | "role" | "status")
                        ? prev.filter((item) => item !== id)
                        : [...prev, id as "name" | "role" | "status"];
                      return next.length === dataTableColumns.length ? prev : next;
                    });
                  }}
                />
                <FilterChips
                  chips={[
                    { id: "all", label: "전체" },
                    { id: "active", label: "Active" },
                    { id: "invited", label: "Invited" },
                    { id: "inactive", label: "Inactive" },
                  ]}
                  activeIds={tableFilters}
                  onToggle={(id) => {
                    setTableFilters((prev) => {
                      if (id === "all") {
                        return ["all"];
                      }
                      const next = prev.includes(id)
                        ? prev.filter((item) => item !== id)
                        : [...prev.filter((item) => item !== "all"), id];
                      return next.length === 0 ? ["all"] : next;
                    });
                  }}
                />
              </div>
              <Text variant="caption" tone="subtle">
                선택된 행: {selectedRowIds.length}
              </Text>
              <Text variant="caption" tone="subtle">
                클릭한 행: {clickedRow ?? "-"}
              </Text>
              <DataTable
                columns={dataTableColumns}
                hiddenColumns={hiddenColumns}
                columnOrder={columnOrder}
                persistKey="design-system-table-widths"
                resetKey={tableResetKey}
                autoFitAnnounce
                autoFitOnDoubleClick
                autoFitResetOnDoubleClick
                emptySlot={
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                      데이터가 없습니다
                    </p>
                    <p className="text-xs text-neutral-500">필터를 초기화하거나 새 항목을 추가하세요.</p>
                  </div>
                }
                rows={
                  showEmptyTable ? [] : [...filteredTableRows, ...filteredTableRows, ...filteredTableRows]
                }
                selectable
                selectedIds={selectedRowIds}
                onSelectionChange={setSelectedRowIds}
                getRowId={(row) => row.id}
                renderRowActions={(row) => (
                  <Button size="sm" variant="ghost">
                    View {row.name}
                  </Button>
                )}
                showActionsOnHover
                onRowClick={(row) => setClickedRow(row.name)}
                stickyHeader
                maxHeightClass="max-h-52"
                rowDensity={tableDensity}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
                emptyMessage="표에 표시할 항목이 없습니다."
              />
            </div>
          </Card>
          <Card title="Empty State" description="빈 상태">
            <EmptyState
              title="아직 데이터가 없어요"
              description="새 항목을 추가해서 시작하세요."
              action={<Button size="sm">새로 만들기</Button>}
            />
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="List" description="텍스트 리스트">
            <List
              items={[
                { title: "알림 설정", description: "푸시 알림 상태", meta: "Active" },
                { title: "팀 초대", description: "3명 초대됨", meta: "Pending" },
                { title: "빌드 상태", description: "최근 24시간", meta: "Healthy" },
              ]}
            />
          </Card>
          <Card title="Card List" description="카드 리스트">
            <CardList
              items={[
                {
                  title: "프로젝트 A",
                  description: "마케팅 랜딩 페이지 제작",
                  badge: <Badge label="진행중" variant="info" size="sm" appearance="soft" />,
                },
                {
                  title: "프로젝트 B",
                  description: "모바일 앱 디자인",
                  badge: <Badge label="완료" variant="success" size="sm" appearance="soft" />,
                },
              ]}
            />
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Notification List" description="알림 센터">
            <NotificationList
              items={[
                {
                  title: "새 댓글",
                  description: "프로젝트 A에 댓글이 달렸어요.",
                  time: "2m ago",
                },
                {
                  title: "빌드 성공",
                  description: "프로덕션 빌드가 완료되었습니다.",
                  time: "1h ago",
                },
              ]}
            />
          </Card>
          <Card title="Timeline" description="활동 로그">
            <Timeline
              items={[
                { title: "기획 완료", description: "요구사항 정리 완료", time: "09:10" },
                { title: "디자인 진행", description: "와이어프레임 제작", time: "10:45" },
                { title: "개발 시작", description: "기본 구조 구성", time: "13:20" },
              ]}
            />
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Pagination" description="페이지네이션">
            <div className="space-y-3">
              <Pagination page={page} totalPages={5} onChange={setPage} />
              <Text variant="body" tone="muted">
                현재 페이지: {page}
              </Text>
            </div>
          </Card>
          <Card title="Stepper" description="진행 단계">
            <div className="space-y-3">
              <Stepper
                steps={[
                  { id: "step-1", label: "기획" },
                  { id: "step-2", label: "디자인" },
                  { id: "step-3", label: "개발" },
                ]}
                activeId={activeStep}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setActiveStep("step-1")}
                >
                  1단계
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setActiveStep("step-2")}
                >
                  2단계
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setActiveStep("step-3")}
                >
                  3단계
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="File Upload" description="파일 업로드">
            <FileUpload label="첨부 파일" helperText="PDF, PNG, JPG 지원" />
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Dropdown" description="드롭다운">
            <Dropdown
              label="역할 선택"
              value={selectedRole}
              onChange={setSelectedRole}
              options={[
                { label: "Designer", value: "designer" },
                { label: "Developer", value: "developer" },
                { label: "PM", value: "pm" },
              ]}
            />
          </Card>
          <Card title="Date Picker" description="날짜 선택">
            <DatePicker label="시작일" value={selectedDate} onChange={setSelectedDate} />
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Profile Card" description="프로필 카드">
            <ProfileCard name="Jinha Kim" role="Frontend Engineer" description="Design System" />
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Search Input" description="검색 바">
            <div className="space-y-3">
              <SearchInput value={searchQuery} onChange={setSearchQuery} />
              <Text variant="caption" tone="subtle">
                Query: {searchQuery || "-"}
              </Text>
            </div>
          </Card>
          <Card title="Filter Chips" description="필터 칩">
            <FilterChips
              chips={[
                { id: "all", label: "전체" },
                { id: "active", label: "진행중" },
                { id: "done", label: "완료" },
              ]}
              activeIds={activeFilters}
              onToggle={(id) => {
                setActiveFilters((prev) =>
                  prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
                );
              }}
            />
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Tag Input" description="태그 입력">
            <TagInput
              label="태그"
              tags={tags}
              onAdd={(tag) => setTags((prev) => [...prev, tag])}
              onRemove={(tag) => setTags((prev) => prev.filter((item) => item !== tag))}
            />
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Checkbox Group" description="체크박스 그룹">
            <CheckboxGroup
              label="권한"
              options={[
                { id: "analytics", label: "Analytics" },
                { id: "billing", label: "Billing" },
                { id: "admin", label: "Admin" },
              ]}
              selectedIds={selectedCheckboxes}
              onChange={setSelectedCheckboxes}
            />
          </Card>
          <Card title="Radio Group" description="라디오 그룹">
            <RadioGroup
              label="플랜"
              options={[
                { id: "basic", label: "Basic" },
                { id: "pro", label: "Pro" },
                { id: "enterprise", label: "Enterprise" },
              ]}
              selectedId={selectedRadio}
              onChange={setSelectedRadio}
            />
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Range Slider" description="슬라이더">
            <RangeSlider label="볼륨" value={rangeValue} onChange={setRangeValue} />
          </Card>
          <Card title="Progress Bar" description="진행률">
            <div className="space-y-3">
              <ProgressBar label="업로드" value={progressValue} />
              <Button size="sm" variant="ghost" onClick={() => setProgressValue(90)}>
                90%로 변경
              </Button>
            </div>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Segmented Control" description="토글 버튼 그룹">
            <div className="space-y-3">
              <SegmentedControl
                segments={[
                  { id: "daily", label: "Daily" },
                  { id: "weekly", label: "Weekly" },
                  { id: "monthly", label: "Monthly" },
                ]}
                activeId={activeSegment}
                onChange={setActiveSegment}
              />
              <Text variant="caption" tone="subtle">
                선택: {activeSegment}
              </Text>
            </div>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Bar Chart" description="간단 막대 차트">
            <BarChart label="월간 방문" values={[12, 24, 18, 30, 22, 28]} />
          </Card>
          <Card title="Line Chart" description="간단 라인 차트">
            <LineChart label="주간 매출" values={[4, 6, 5, 8, 7, 9]} />
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Topbar" description="상단 바">
            <Topbar title="프로젝트 대시보드" rightSlot={<Button size="sm">New</Button>} />
          </Card>
          <Card title="Sidebar" description="사이드바">
            <Sidebar
              sections={[
                {
                  id: "main",
                  label: "Main",
                  items: [
                    { id: "overview", label: "Overview", icon: <Icon symbol="◼" size="sm" /> },
                    { id: "projects", label: "Projects", icon: <Icon symbol="◆" size="sm" /> },
                  ],
                },
                {
                  id: "manage",
                  label: "Manage",
                  items: [{ id: "settings", label: "Settings", icon: <Icon symbol="⚙" size="sm" /> }],
                },
              ]}
              activeId={activeSidebar}
              onChange={setActiveSidebar}
            />
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Two Column Layout" description="2열 레이아웃">
            <TwoColumnLayout
              left={<Card title="Left" description="좌측 영역" />}
              right={<Card title="Right" description="우측 영역" />}
            />
          </Card>
          <Card title="Three Column Layout" description="3열 레이아웃">
            <ThreeColumnLayout
              left={<Card title="Left" description="좌측" />}
              center={<Card title="Center" description="중앙" />}
              right={<Card title="Right" description="우측" />}
            />
          </Card>
        </div>

        <Card title="Card Grid" description="카드 그리드">
          <CardGrid>
            <Card title="Card 1" description="Auto layout" />
            <Card title="Card 2" description="Auto layout" />
            <Card title="Card 3" description="Auto layout" />
            <Card title="Card 4" description="Auto layout" />
            <Card title="Card 5" description="Auto layout" />
            <Card title="Card 6" description="Auto layout" />
          </CardGrid>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Avatar Group" description="아바타 스택">
            <AvatarGroup
              items={[
                { name: "Jinha Kim" },
                { name: "Alex Park" },
                { name: "Jamie Lee" },
                { name: "Taylor Seo" },
              ]}
            />
          </Card>
          <Card title="Spinner" description="로딩 스피너">
            <div className="flex flex-wrap items-center gap-4">
              <Spinner size="sm" label="Loading" />
              <Spinner size="md" />
              <Spinner size="lg" />
            </div>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Skeleton" description="스켈레톤 로더">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Accordion" description="아코디언">
            <Accordion
              items={[
                { id: "item-1", title: "섹션 1", content: "첫 번째 콘텐츠" },
                { id: "item-2", title: "섹션 2", content: "두 번째 콘텐츠" },
                { id: "item-3", title: "섹션 3", content: "세 번째 콘텐츠" },
              ]}
              openId={openAccordion}
              onChange={setOpenAccordion}
            />
          </Card>
          <Card title="Tooltip" description="툴팁">
            <Tooltip label="도움말">
              <Button size="sm" variant="ghost">
                Hover me
              </Button>
            </Tooltip>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Dropdown Menu" description="드롭다운 메뉴">
            <DropdownMenu label="Actions" items={["Edit", "Duplicate", "Archive"]} />
          </Card>
        </div>
        <UiToaster />
        </Container>
      </div>

      <Modal
        title="Example Modal"
        description="디자인 시스템 모달 예시"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="space-y-4">
          <Text variant="body" tone="muted">
            모달 콘텐츠 영역입니다.
          </Text>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              취소
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>확인</Button>
          </div>
        </div>
      </Modal>
      <Drawer title="Example Drawer" isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <Text variant="body" tone="muted">
          Drawer 콘텐츠 영역입니다.
        </Text>
      </Drawer>
      <Overlay isOpen={isOverlayOpen} onClose={() => setIsOverlayOpen(false)}>
        <div className="space-y-3">
          <Text variant="subheading" tone="default" weight="semibold">
            Overlay Content
          </Text>
          <Text variant="body" tone="muted">
            오버레이 내용을 여기에 배치합니다.
          </Text>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsOverlayOpen(false)}>
              닫기
            </Button>
          </div>
        </div>
      </Overlay>
    </main>
  );
}
