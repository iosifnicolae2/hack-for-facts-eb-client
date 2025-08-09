import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { BarChart3, Plus, Search as SearchIcon, MoreHorizontal, Pencil, Trash2, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ChartCategory, StoredChart, getChartsStore } from "@/components/charts/chartsStore";
import { ChartList } from "@/components/charts/components/chart-list/ChartList";
import { slugify } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Input as UITextInput } from "@/components/ui/input";
import { usePersistedState } from "@/lib/hooks/usePersistedState";

export const Route = createLazyFileRoute("/charts/")({
  component: ChartsListPage,
});

const chartsStore = getChartsStore();

type SortOption = "newest" | "oldest" | "a-z" | "z-a" | "favorites-first";

type ActiveTab = "all" | "favorites" | `category:${string}`;

function ChartsListPage() {
  const [charts, setCharts] = useState<StoredChart[]>(
    chartsStore.loadSavedCharts({ filterDeleted: true, sort: true })
  );
  const [search, setSearch] = useState<string>("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [sortBy, setSortBy] = usePersistedState<SortOption>("charts-page-sort-by", "newest");
  const [categories, setCategories] = useState<readonly ChartCategory[]>(chartsStore.loadCategories());
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isRenameCategoryOpen, setIsRenameCategoryOpen] = useState(false);
  const [renameCategoryId, setRenameCategoryId] = useState<string | null>(null);
  const [renameCategoryName, setRenameCategoryName] = useState("");

  const handleDeleteChart = useCallback(async (chartId: string) => {
    try {
      await chartsStore.deleteChart(chartId);
      setCharts((previousCharts) => previousCharts.filter((chart) => chart.id !== chartId));
      toast.success("Chart deleted");
    } catch (error) {
      console.error("Failed to delete chart:", error);
      toast.error("Failed to delete the chart. Please try again.");
    }
  }, []);

  const handleToggleFavorite = useCallback((chartId: string) => {
    chartsStore.toggleChartFavorite(chartId);
    setCharts((previousCharts) => {
      const chartBeforeToggle = previousCharts.find((c) => c.id === chartId);
      const updatedCharts = previousCharts.map((chart) =>
        chart.id === chartId ? { ...chart, favorite: !chart.favorite } : chart
      );
      toast.success(
        chartBeforeToggle?.favorite ? "Removed from Favorites" : "Added to Favorites"
      );
      return updatedCharts;
    });
  }, []);

  useEffect(() => {
    const reloadFromStorage = () => {
      setCharts(chartsStore.loadSavedCharts({ filterDeleted: true, sort: true }));
      setCategories(chartsStore.loadCategories());
    };
    window.addEventListener("storage", reloadFromStorage);
    return () => window.removeEventListener("storage", reloadFromStorage);
  }, []);

  const totalCount = charts.length;
  const favoritesCount = useMemo(
    () => charts.filter((chart) => chart.favorite).length,
    [charts]
  );

  const baseFilteredSortedCharts = useMemo(() => {
    const rawQuery = search.trim();
    const hashtagMatches = Array.from(rawQuery.matchAll(/#([\p{L}\p{N}_-]+)/gu)).map((m) =>
      slugify(m[1])
    );
    const queryText = rawQuery.replace(/#([\p{L}\p{N}_-]+)/gu, " ").trim().toLowerCase();

    const byQuery = (c: StoredChart) => {
      const textMatch =
        queryText.length === 0 ||
        c.title.toLowerCase().includes(queryText) ||
        (c.description ?? "").toLowerCase().includes(queryText);

      if (hashtagMatches.length === 0) return textMatch;

      const chartCategorySlugs = (c.categories ?? [])
        .map((id) => categories.find((cat) => cat.id === id)?.name)
        .filter(Boolean)
        .map((name) => slugify(name as string));

      const tagsMatch = hashtagMatches.every((t) =>
        chartCategorySlugs.some((slug) => slug.startsWith(t))
      );

      return textMatch && tagsMatch;
    };

    const sorted = (input: readonly StoredChart[]): StoredChart[] => {
      const arr = [...input];
      switch (sortBy) {
        case "oldest":
          return arr.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
        case "a-z":
          return arr.sort((a, b) => a.title.localeCompare(b.title));
        case "z-a":
          return arr.sort((a, b) => b.title.localeCompare(a.title));
        case "favorites-first":
          return arr.sort((a, b) => Number(b.favorite) - Number(a.favorite));
        case "newest":
        default:
          return arr.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
      }
    };

    return sorted(charts.filter(byQuery));
  }, [charts, search, sortBy, categories]);

  const filteredAllCharts = baseFilteredSortedCharts;
  const filteredFavoriteCharts = useMemo(
    () => baseFilteredSortedCharts.filter((c) => c.favorite),
    [baseFilteredSortedCharts]
  );

  const handleCreateCategory = useCallback(() => {
    const name = newCategoryName.trim();
    if (!name) {
      toast.error("Please enter a category name");
      return;
    }
    try {
      const created = chartsStore.createCategory(name);
      setCategories(chartsStore.loadCategories());
      setIsCreateCategoryOpen(false);
      setNewCategoryName("");
      // Switch to the new category tab
      setActiveTab(`category:${created.id}`);
      toast.success("Category created");
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Failed to create category");
    }
  }, [newCategoryName]);

  const openRenameCategory = useCallback((id: string) => {
    const current = categories.find((c) => c.id === id);
    if (!current) return;
    setRenameCategoryId(id);
    setRenameCategoryName(current.name);
    setIsRenameCategoryOpen(true);
  }, [categories]);

  const submitRenameCategory = useCallback(() => {
    const id = renameCategoryId;
    const name = renameCategoryName.trim();
    if (!id) return;
    if (!name) {
      toast.error("Please enter a category name");
      return;
    }
    chartsStore.renameCategory(id, name);
    setCategories(chartsStore.loadCategories());
    setIsRenameCategoryOpen(false);
    toast.success("Category renamed");
  }, [renameCategoryId, renameCategoryName]);

  const handleDeleteCategory = useCallback((id: string) => {
    const current = categories.find((c) => c.id === id);
    if (!current) return;
    chartsStore.deleteCategory(id);
    setCategories(chartsStore.loadCategories());
    setCharts(chartsStore.loadSavedCharts({ filterDeleted: true, sort: true }));
    if (activeTab === `category:${id}`) setActiveTab("all");
    toast.success("Category deleted");
  }, [categories, activeTab]);

  const handleToggleChartCategory = useCallback((chartId: string, categoryId: string) => {
    chartsStore.toggleChartCategory(chartId, categoryId);
    setCharts((prev) => prev.map((c) => c.id === chartId ? { ...c, categories: (c.categories ?? []).includes(categoryId) ? (c.categories ?? []).filter((id) => id !== categoryId) : [...(c.categories ?? []), categoryId] } : c));
  }, []);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="rounded-xl border bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
              <BarChart3 className="h-8 w-8 md:h-10 md:w-10 text-primary" />
              Charts
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Build and manage custom visualizations of public spending data.
            </p>
            <div className="flex gap-2 pt-1">
              <Badge variant="secondary">{totalCount} total</Badge>
              {favoritesCount > 0 ? (
                <Badge variant="success">{favoritesCount} favorites</Badge>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/charts/new" replace={false}>
              <Button size="lg" className="text-base h-11 px-6">
                <Plus className="mr-2 h-5 w-5" />
                Create chart
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="relative w-full md:max-w-lg">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            placeholder="Search charts…"
            className="pl-9"
            aria-label="Search charts"
          />
        </div>
        <div className="flex items-center gap-3">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="a-z">Title A–Z</SelectItem>
              <SelectItem value="z-a">Title Z–A</SelectItem>
              <SelectItem value="favorites-first">Favorites first</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="text-center py-16">
          <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No charts yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first chart to start visualizing public spending data.
          </p>
          <Link to="/charts/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create your first chart
            </Button>
          </Link>
        </div>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as ActiveTab)}
          className="space-y-4"
        >
          <div className="max-w-full overflow-x-auto hide-scrollbar">
            <TabsList className="inline-flex items-center gap-1 whitespace-nowrap h-8 bg-muted/30 p-1 rounded-md min-w-max">
              <TabsTrigger className="h-7 px-2 text-xs" value="all">All</TabsTrigger>
              <TabsTrigger className="h-7 px-2 text-xs" value="favorites" disabled={favoritesCount === 0}>
                Favorites
              </TabsTrigger>
              {categories.map((cat) => (
                <CategoryTab
                  key={cat.id}
                  category={cat}
                  onRename={() => openRenameCategory(cat.id)}
                  onDelete={() => handleDeleteCategory(cat.id)}
                  onSelect={() => setActiveTab(`category:${cat.id}`)}
                />
              ))}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="ml-1 h-7 w-7"
                onClick={() => setIsCreateCategoryOpen(true)}
                aria-label="New category"
                title="New category"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TabsList>
          </div>

          <TabsContent value="all">
            {filteredAllCharts.length === 0 ? (
              <div className="text-center py-12">
                <h4 className="text-lg font-medium mb-1">No results</h4>
                <p className="text-muted-foreground">
                  Try a different search term or sorting.
                </p>
              </div>
            ) : (
              <ChartList
                charts={filteredAllCharts}
                onDelete={handleDeleteChart}
                onToggleFavorite={handleToggleFavorite}
                categories={categories}
                onToggleCategory={handleToggleChartCategory}
                onOpenCategory={(categoryId) => setActiveTab(`category:${categoryId}`)}
              />
            )}
          </TabsContent>

          <TabsContent value="favorites">
            {filteredFavoriteCharts.length === 0 ? (
              <div className="text-center py-12">
                <h4 className="text-lg font-medium mb-1">No favorites yet</h4>
                <p className="text-muted-foreground">
                  Mark charts as favorites to quickly find them here.
                </p>
              </div>
            ) : (
              <ChartList
                charts={filteredFavoriteCharts}
                onDelete={handleDeleteChart}
                onToggleFavorite={handleToggleFavorite}
                categories={categories}
                onToggleCategory={handleToggleChartCategory}
                onOpenCategory={(categoryId) => setActiveTab(`category:${categoryId}`)}
              />
            )}
          </TabsContent>

          {categories.map((cat) => {
            const chartsInCat = baseFilteredSortedCharts.filter((c) => (c.categories ?? []).includes(cat.id));
            return (
              <TabsContent key={cat.id} value={`category:${cat.id}`}>
                {chartsInCat.length === 0 ? (
                  <div className="text-center py-12">
                    <h4 className="text-lg font-medium mb-1">No charts in “{cat.name}”</h4>
                    <p className="text-muted-foreground">
                      Use the tag menu on a chart card to add it to this category.
                    </p>
                  </div>
                ) : (
                  <ChartList
                    charts={chartsInCat}
                    onDelete={handleDeleteChart}
                    onToggleFavorite={handleToggleFavorite}
                    categories={categories}
                    onToggleCategory={handleToggleChartCategory}
                    onOpenCategory={(categoryId) => setActiveTab(`category:${categoryId}`)}
                  />
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create category</DialogTitle>
            <DialogDescription>Group charts with a custom category. You can search by category using #hashtag.</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <UITextInput
              autoFocus
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.currentTarget.value)}
              placeholder="Category name"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCreateCategoryOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCategory}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRenameCategoryOpen} onOpenChange={setIsRenameCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename category</DialogTitle>
            <DialogDescription>Update the category name. You can still search it with #hashtag.</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <UITextInput
              autoFocus
              value={renameCategoryName}
              onChange={(e) => setRenameCategoryName(e.currentTarget.value)}
              placeholder="Category name"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsRenameCategoryOpen(false)}>Cancel</Button>
            <Button onClick={submitRenameCategory}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sub-components for readability
type CategoryTabProps = {
  category: ChartCategory;
  onRename: () => void;
  onDelete: () => void;
  onSelect: () => void;
};

function CategoryTab({ category, onRename, onDelete, onSelect }: CategoryTabProps) {
  return (
    <div className="inline-flex items-center">
      <TabsTrigger value={`category:${category.id}`} className="flex items-center gap-1 h-7 px-2 text-xs" onClick={onSelect}>
        <Tag className="h-3.5 w-3.5" />
        {category.name}
      </TabsTrigger>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="ml-1 h-7 w-7">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={onRename}>
            <Pencil className="h-4 w-4" /> Rename
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="text-destructive">
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                Confirm Delete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Cancel</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}