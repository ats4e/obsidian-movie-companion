import { App } from "obsidian";
import { MovieLight, Movie, Poster } from "@models/MovieModels";
import { PluginSettings } from "@settings/PluginSettings";

import { IsOverwriteFileModal } from "@modals/is_overwrite_file";
import { MovieSearchModal } from "@modals/MovieSearchModal";
import { MovieSuggestModal } from "@modals/MovieSuggestModal";
import { BaseRenderableService } from "./BaseRenderableService";
import { getMoviesAPI } from "@apis/ApiFactory";
import { SelectImageModal } from "@modals/SelectImageModal";

import i18n from './I18nService';

export class MovieService extends BaseRenderableService {
  constructor(
    protected app: App,
    protected settings: PluginSettings,
    protected show_notice: (message: unknown) => Promise<void>,
    protected movie_note_created: (movie: Movie) => Promise<void>,
  ) {
    super(app, settings, show_notice);
  }

  async createNewMovieNote(): Promise<void> {
    if (!this.settings.api_key) {
      this.show_notice(i18n.t("errors.invalidTmdbApiKey"));
      return;
    }
    try {
      const movie = await this.findMovie();
      const file_path = await this.getFilePath(movie, this.settings.movie_folder);
      let file = this.app.vault.getFileByPath(file_path);

      let create_file = true;
      
      if (file) {
        const is_overwrite = await this.openBoolModal(
          IsOverwriteFileModal,
          file.name
        );
        
        create_file = is_overwrite;
        
        if (is_overwrite)
          await this.app.fileManager.trashFile(file);
      }
      
      if(create_file) {
        const rendered_contents = await this.templateService.getRenderedContent(movie, this.settings.movie_template_file);

        file = await this.app.vault.create(
          file_path,
          rendered_contents
        );
      }

      this.movie_note_created(movie);

      if (this.settings.open_page_on_completion)
        this.openNote(file);

    } catch (err) {
      console.warn(err);
      this.show_notice(err);
    }
  }

  /**
   * Finds a movie based on the provided query.
   * 
   * This method first opens a movie search modal to find movies matching the query.
   * If multiple movies are found, it opens a suggestion modal to allow the user to select one.
   * Finally, it retrieves and returns the complete data for the selected movie.
   * 
   * @param {string} [query] - The search query to find the movie.
   * @returns {Promise<Movie>} - A promise that resolves to the complete movie data.
   */
  async findMovie(query?: string): Promise<Movie> {
    const searched_movies = await this.openMovieSearchModal(query);

    let movieLight = searched_movies[0];
    if (searched_movies.length > 1)
      movieLight = await this.openMovieSuggestModal(searched_movies);

    const movie = await this.getCompleteMovieData(movieLight);

    if(this.settings.manual_poster_choise && movie.posters && movie.posters.length > 1){
      const selected_poster_path = await this.openSelectPosterModal(movie.posters);
      movie.poster_path = selected_poster_path;
    }

    return movie
  }

  async getCompleteMovieData(movie_search: MovieLight): Promise<Movie> {
    const service_provider = getMoviesAPI(this.settings);
    return await service_provider.get_movie_by_id(
      movie_search.id,
      movie_search.media_type
    );
  }  

  async openMovieSearchModal(query = ""): Promise<MovieLight[]> {
    return new Promise((resolve, reject) => {
      return new MovieSearchModal(
        this.app,
        this.settings,
        query,
        (error, results) => {
          return error ? reject(error) : resolve(results);
        }
      ).open();
    });
  }

  async openMovieSuggestModal(movies: MovieLight[]): Promise<MovieLight> {
    return new Promise((resolve, reject) => {
      return new MovieSuggestModal(
        this.app,
        movies,
        (error, selected_movie) => {
          return error ? reject(error) : resolve(selected_movie);
        }
      ).open();
    });
  }

  async openSelectPosterModal(posters: Poster[]): Promise<string> {

    const postersPaths = posters.map((poster) => {
      return poster.file_path;
    });

    return new Promise((resolve, reject) => {
      return new SelectImageModal(
        this.app,
        postersPaths,
        (error, selected_path) => {
          return error ? reject(error) : resolve(selected_path);
        }
      ).open();
    });
  }
}
